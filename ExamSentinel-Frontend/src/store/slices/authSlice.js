// store/slices/authSlice.js
import apiClient from "@/services/apiClient";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunks for auth operations
export const verifyToken = createAsyncThunk(
  "auth/verifyToken",
  async (_, { rejectWithValue }) => {
    try {
      const token = sessionStorage.getItem("authToken");
      const studentData = sessionStorage.getItem("studentData");

      if (!token || !studentData) {
        throw new Error("No valid session found");
      }

      // 🔧 TEMPORARY BYPASS: Assume token is always valid for local development
      return {
        token,
        student: JSON.parse(studentData),
        isValid: true,
      };

      // ✅ Uncomment below for real API verification in production
      /*
      const response = await axios.get('http://localhost:3001/api/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
      });

      return {
        token,
        student: JSON.parse(studentData),
        isValid: response.data.valid
      };
      */
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Authentication failed"
      );
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const token = sessionStorage.getItem("authToken");
      if (token) {
        // await axios.post('http://localhost:3001/api/auth/logout', {}, {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        await apiClient.post("api/auth/logout", {});
      }

      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("studentData");
      sessionStorage.removeItem("permissionsData");
      sessionStorage.removeItem("userData");

      return true;
    } catch (error) {
      // Even if logout fails on server, clear local storage
      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("studentData");
       sessionStorage.removeItem("permissionsData");
      sessionStorage.removeItem("userData");
      return rejectWithValue(error.response?.data?.message || "Logout failed");
    }
  }
);

// export const initializeAuthWithPhoto = createAsyncThunk(
//   "auth/initializeAuthWithPhoto",
//   async (_, thunkAPI) => {
//     const token = sessionStorage.getItem("authToken");
//     const studentData = sessionStorage.getItem("studentData");
    

//     if (token && studentData) {
//       const student = JSON.parse(studentData);

//       // 👉 Fetch profile photo if student_picture exists
//       let profilePhoto = null;
//       if (student?.student_picture) {
//         const res = await apiClient.post(
//           "/api/student/students_pic",
//           { student_picture: student.student_picture,exam_id: student.student_exam_id  },
//           { responseType: "blob" }
//         );

//         if (res.status === 200) {
//           const blob = res.data;
//           profilePhoto = URL.createObjectURL(blob);
//         }
//       }

//       return {
//         token,
//         student,
//         profilePhoto,
//       };
//     }

//     throw new Error("No valid session found");
//   }
// );

export const initializeAuthWithPhoto = createAsyncThunk(
  "auth/initializeAuthWithPhoto",
  async (_, thunkAPI) => {
    const token = sessionStorage.getItem("authToken");
    const studentData = sessionStorage.getItem("studentData");
    
    if (token && studentData) {
      const student = JSON.parse(studentData);

      let profilePhoto = null;
      if (student?.student_picture) {
        try {
          const res = await apiClient.post(
            "/api/student/students_pic",
            { 
              student_picture: student.student_picture,
              exam_id: student.student_exam_id  
            },
            { responseType: "blob" }
          );

          if (res.status === 200 && res.data) {
            const blob = res.data;
            profilePhoto = URL.createObjectURL(blob);
          }
        } catch (error) {
          // 👉 Log the error but don't reject the thunk
          console.error("Failed to fetch profile photo:", error);
          // profilePhoto remains null - user can still authenticate
        }
      }

      return {
        token,
        student,
        profilePhoto, // Will be null if fetch failed
      };
    }

    throw new Error("No valid session found");
  }
);

const token = sessionStorage.getItem("authToken");
const studentData = sessionStorage.getItem("studentData");

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: token || null,
    student: studentData || null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    sessionExpired: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSessionExpired: (state, action) => {
      state.sessionExpired = action.payload;
    },
    initializeAuth: (state) => {
      const token = sessionStorage.getItem("authToken");
      
      const studentData = sessionStorage.getItem("studentData");

      if (token && studentData) {
        state.token = token;
        state.student = JSON.parse(studentData);
        state.isAuthenticated = true;
      }
    },
     // 👉 New reducer for login success
    setAuthData: (state, action) => {
      const { token, user } = action.payload;
      state.token = token;
      state.student = user;
      state.isAuthenticated = true;
      state.error = null;
      state.sessionExpired = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Verify Token
      .addCase(verifyToken.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.student = action.payload.student;
        state.isAuthenticated = action.payload.isValid;
        state.sessionExpired = false;
      })
      .addCase(verifyToken.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.sessionExpired = true;
        state.token = null;
        state.student = null;
      })
      // Logout
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.token = null;
        state.student = null;
        state.isAuthenticated = false;
        state.error = null;
        state.sessionExpired = false;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        // Still clear auth state even if server logout failed
        state.token = null;
        state.student = null;
        state.isAuthenticated = false;
      });
  },
  extraReducers: (builder) => {
  builder
    .addCase(initializeAuthWithPhoto.fulfilled, (state, action) => {
      state.token = action.payload.token;
      state.student = action.payload.student;
      state.profilePhoto = action.payload.profilePhoto;
      state.isAuthenticated = true;
      state.sessionExpired = false;
    })
    .addCase(initializeAuthWithPhoto.rejected, (state) => {
      state.token = null;
      state.student = null;
      state.profilePhoto = null;
      state.isAuthenticated = false;
      state.sessionExpired = true;
    });
}

});

export const { clearError, setSessionExpired, initializeAuth, setAuthData } =
  authSlice.actions;
export default authSlice.reducer;
