import axios from 'axios';
const API_BASE_URL =  process.env.REACT_APP_SERVER_HTTPS || 'http://localhost:5000/api';


const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Login
// Login
export const loginUser = async (email: string, password: string, asGuest: boolean) => {
    try {
        const response = await api.post('/auth/login', { email, password, asGuest });
        return response.data;
    } catch (error: any) {
        if (error.response) {
            return error.response.data;  // API response with error details
        } else {
            throw new Error('Network or server error occurred');
        }
    }
};

// register
type RegisterCommand={
    email:string;
    password:string;
    confirmPassword:string;
    firstName:string;
    lastName:string;
    displayName?:string;
}
export const registerUser = async (command:RegisterCommand)=>{
    try{
        const response = await api.post('/auth/register',command);
        return response.data;
    }
    catch(error:any){
        return error.response.data;
    }
}
