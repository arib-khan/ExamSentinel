// Utility function to find the appropriate server for a student
export const findServerForStudent = (rollNumber, planList) => {
    if (!rollNumber || !planList || planList.length === 0) {
        return null;
    }

    // Normalize roll number to uppercase for comparison
    const normalizedRollNumber = rollNumber.toUpperCase();

    // Find the plan that contains this student
    const matchingPlan = planList.find(plan => {
        const fromRoll = plan.seat_plan_from_student_rollnumber?.toUpperCase();
        const toRoll = plan.seat_plan_to_student_roll_number?.toUpperCase();

        // Check if student roll number falls within the range
        return normalizedRollNumber >= fromRoll && normalizedRollNumber <= toRoll;
    });

    return matchingPlan;
};

// Function to get server IP address from the plan
export const getServerIP = (plan) => {
    if (!plan) return null;

    // Check both possible IP address fields
    return plan.seat_plan_local_server_ipaddress || plan.seat_plan_local_server_id;
};

// Function to call the registration API
export const registerStudentToServer = async (studentData, serverIP) => {
    if (!serverIP) {
        throw new Error("Server IP address not found");
    }

    const apiEndpoint = `http://${serverIP}/api/studentext/seat_allocation`;
    const token = sessionStorage.getItem("authToken");

    if (!token) {
        throw new Error("Auth token not found in sessionStorage");
    }

    // Payload to send
    const payload = {
        student_roll: studentData.roll_number,
    };

    try {
        const response = await fetch(apiEndpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,   // <-- token passed here
            },
            body: JSON.stringify(payload),
        });

        console.log(response);
        

        // If response is not OK -> Throw error
        // if (!response.ok) {
        //     const errorText = await response.text();
        //     throw new Error(`Server error: ${response.status} - ${errorText}`);
        // }

        // Parse JSON response
        const data = await response.json();
        return data;

    } catch (error) {
        console.error("Error registering student:", error);
        throw error;
    }
};