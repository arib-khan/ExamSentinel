import fitz  # PyMuPDF
import os
import re
import mysql.connector
from PIL import Image
import io

# ==== Setup ====
pdf_file = r"IIT_JEE_Excel.pdf"
image_output_dir = "extracted_diagrams"
os.makedirs(image_output_dir, exist_ok=True)

# ==== Open PDF ====
doc = fitz.open(pdf_file)

# ==== MySQL DB Connection ====
conn = mysql.connector.connect(
    host='192.168.1.250',
    user='vid1969',
    password='Vijit$1969',
    database='test'
)
cursor = conn.cursor()

insert_query = """
INSERT INTO onlnexam_questions 
(subject, section, question_text, option_a, option_b, option_c, option_d, correct_option, image_url)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
"""

# ==== Helper Functions ====
def is_diagram_image(image_bytes, min_size=(50, 50), max_aspect_ratio=15):
    """
    Determine if an image is likely a diagram based on size and aspect ratio
    """
    try:
        img = Image.open(io.BytesIO(image_bytes))
        width, height = img.size
        
        # Filter out very small images
        if width < min_size[0] or height < min_size[1]:
            return False
            
        # Filter out extremely wide/tall images (likely text lines)
        aspect_ratio = max(width/height, height/width)
        if aspect_ratio > max_aspect_ratio:
            return False
            
        # Additional checks for diagram characteristics
        # Convert to grayscale for analysis
        gray_img = img.convert('L')
        
        # Check if image has sufficient contrast
        import numpy as np
        img_array = np.array(gray_img)
        if img_array.std() < 15:  # Very low contrast, likely not a diagram
            return False
            
        return True
    except:
        return False

def analyze_image_position(page, img_bbox, text_analysis):
    """
    Analyze image position to determine if it's a question diagram or option diagram
    """
    img_x0, img_y0, img_x1, img_y1 = img_bbox
    img_center_y = (img_y0 + img_y1) / 2
    img_center_x = (img_x0 + img_x1) / 2
    
    # Find nearby text to determine context
    nearby_options = []
    question_numbers = []
    
    for item in text_analysis:
        text, bbox = item['text'], item['bbox']
        text_y = (bbox[1] + bbox[3]) / 2
        text_x = (bbox[0] + bbox[2]) / 2
        
        # Check for option labels (A), (B), (C), (D)
        if re.match(r'^\([ABCD]\)', text.strip()):
            distance = abs(text_y - img_center_y)
            if distance < 100:  # Within reasonable distance
                nearby_options.append({
                    'option': text.strip(),
                    'distance': distance,
                    'position': (text_x, text_y)
                })
        
        # Check for question numbers
        if re.match(r'^\d+\.', text.strip()):
            distance = abs(text_y - img_center_y)
            if distance < 200:  # Within reasonable distance
                q_num = re.match(r'^(\d+)\.', text.strip())
                if q_num:
                    question_numbers.append({
                        'number': int(q_num.group(1)),
                        'distance': distance
                    })
    
    return {
        'nearby_options': sorted(nearby_options, key=lambda x: x['distance']),
        'nearby_questions': sorted(question_numbers, key=lambda x: x['distance'])
    }

def extract_question_info(text, question_num):
    """
    Extract question text and options for a specific question number
    """
    # Pattern to match question number and extract content until next question
    pattern = rf"{question_num}\.\s*(.*?)(?=\n\d+\.|$)"
    match = re.search(pattern, text, re.DOTALL)
    
    if not match:
        return None
        
    question_block = match.group(1).strip()
    
    # Split options using (A), (B), (C), (D) pattern
    option_pattern = r'\(([ABCD])\)\s*([^(]*?)(?=\([ABCD]\)|$)'
    options = re.findall(option_pattern, question_block)
    
    if len(options) < 4:
        return None
        
    # Extract question text (everything before first option)
    question_text = re.split(r'\([ABCD]\)', question_block)[0].strip()
    
    opt_dict = {letter: text.strip() for letter, text in options}
    
    return {
        'question_text': question_text,
        'option_a': opt_dict.get('A', ''),
        'option_b': opt_dict.get('B', ''),
        'option_c': opt_dict.get('C', ''),
        'option_d': opt_dict.get('D', '')
    }

def get_subject_section(page_num, question_num):
    """
    Determine subject and section based on question number
    """
    if question_num <= 25:
        if question_num <= 20:
            return "Mathematics", "I"
        else:
            return "Mathematics", "II"
    elif question_num <= 50:
        if question_num <= 45:
            return "Physics", "I"
        else:
            return "Physics", "II"
    else:
        if question_num <= 70:
            return "Chemistry", "I"
        else:
            return "Chemistry", "II"

# ==== Process Pages ====
question_diagrams = {}  # Store diagrams for each question
diagram_counter = 1

for page_num, page in enumerate(doc):
    print(f"\nProcessing page {page_num + 1}...")
    
    text = page.get_text("text")
    
    # Get detailed text with positions for analysis
    text_dict = page.get_text("dict")
    text_analysis = []
    
    for block in text_dict["blocks"]:
        if "lines" in block:
            for line in block["lines"]:
                for span in line["spans"]:
                    text_analysis.append({
                        'text': span["text"],
                        'bbox': span["bbox"]
                    })
    
    images = page.get_images(full=True)
    
    if not images:
        continue
    
    print(f"Found {len(images)} images on page {page_num + 1}")
    
    # Extract and analyze each image
    for img_index, img in enumerate(images):
        xref = img[0]
        base_image = doc.extract_image(xref)
        image_bytes = base_image["image"]
        image_ext = base_image["ext"]
        
        # Get image position on page
        img_rects = page.get_image_rects(xref)
        if not img_rects:
            continue
            
        img_bbox = img_rects[0]
        
        # Check if this is likely a diagram
        if is_diagram_image(image_bytes):
            # Analyze image position to determine context
            position_analysis = analyze_image_position(page, img_bbox, text_analysis)
            
            # Determine the question number
            question_num = None
            if position_analysis['nearby_questions']:
                question_num = position_analysis['nearby_questions'][0]['number']
            
            if question_num:
                subject, section = get_subject_section(page_num, question_num)
                
                # Initialize question diagrams if not    
                if question_num not in question_diagrams:
                    question_diagrams[question_num] = {
                        'subject': subject,
                        'section': section,
                        'main_diagram': None,
                        'option_diagrams': {}
                    }
                
                # Determine if this is a main question diagram or option diagram
                if position_analysis['nearby_options']:
                    # This is likely an option diagram
                    closest_option = position_analysis['nearby_options'][0]['option']
                    option_letter = closest_option.replace('(', '').replace(')', '')
                    
                    # Save option diagram
                    option_filename = f"Q{question_num}option{option_letter}_{subject}_{section}.{image_ext}"
                    option_path = os.path.join(image_output_dir, option_filename)
                    
                    with open(option_path, "wb") as f:
                        f.write(image_bytes)
                    
                    question_diagrams[question_num]['option_diagrams'][option_letter] = option_filename
                    print(f"  ✅ Extracted option diagram: {option_filename}")
                    
                else:
                    # This is likely a main question diagram
                    main_filename = f"Q{question_num}_{subject}_{section}.{image_ext}"
                    main_path = os.path.join(image_output_dir, main_filename)
                    
                    with open(main_path, "wb") as f:
                        f.write(image_bytes)
                    
                    question_diagrams[question_num]['main_diagram'] = main_filename
                    print(f"  ✅ Extracted main diagram: {main_filename}")
            
            diagram_counter += 1
        else:
            print(f"  ❌ Skipped non-diagram image {img_index + 1}")

# ==== Insert Questions into Database ====
print(f"\n📝 Inserting questions into database...")

# Get all question numbers from text
all_text = ""
for page_num, page in enumerate(doc):
    all_text += page.get_text("text") + "\n"

question_matches = re.findall(r'^(\d+)\.', all_text, re.MULTILINE)

for q_match in question_matches:
    q_num = int(q_match)
    
    # Extract question details
    question_info = extract_question_info(all_text, q_num)
    
    if question_info:
        # Get subject and section
        subject, section = get_subject_section(0, q_num)
        
        # Get diagrams for this question
        diagrams = question_diagrams.get(q_num, {})
        main_diagram = diagrams.get('main_diagram')
        option_diagrams = diagrams.get('option_diagrams', {})
        
        # Create image_url string that includes all diagrams
        image_urls = []
        if main_diagram:
            image_urls.append(f"main:{main_diagram}")
        
        for opt_letter in ['A', 'B', 'C', 'D']:
            if opt_letter in option_diagrams:
                image_urls.append(f"option{opt_letter}:{option_diagrams[opt_letter]}")
        
        image_url_string = "|".join(image_urls) if image_urls else None
        
        # Insert into database
        cursor.execute(insert_query, (
            subject,
            section,
            question_info['question_text'],
            question_info['option_a'],
            question_info['option_b'],
            question_info['option_c'],
            question_info['option_d'],
            None,  # correct_option - to be filled later
            image_url_string
        ))
        
        print(f"  📝 Inserted Q{q_num} ({subject}-{section}): {question_info['question_text'][:50]}...")
        if main_diagram:
            print(f"      🖼️  Main diagram: {main_diagram}")
        if option_diagrams:
            for opt, filename in option_diagrams.items():
                print(f"      🔤  Option {opt} diagram: {filename}")

# ==== Finalize ====
conn.commit()
cursor.close()
conn.close()
doc.close()

print(f"\n✅ Processing complete!")
print(f"📊 Total diagrams extracted: {diagram_counter - 1}")
print(f"💾 All diagrams saved to: {image_output_dir}/")
print(f"🗃️  Questions with diagrams inserted into database")

# ==== Summary Report ====
print(f"\n📋 Summary Report:")
main_diagrams = sum(1 for q in question_diagrams.values() if q.get('main_diagram'))
option_diagrams = sum(len(q.get('option_diagrams', {})) for q in question_diagrams.values())

print(f"📊 Questions with main diagrams: {main_diagrams}")
print(f"🔤 Questions with option diagrams: {option_diagrams}")
print(f"📁 Total image files created: {main_diagrams + option_diagrams}")