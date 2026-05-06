import {createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";


const Authcontext = createContext()


export const AuthProvider = ({children})=>{
    const [user,setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchCurrentUser = async () =>{
        try {
            const res = await api.get('/auth/me');
            setUser(res.data);
            return res.data;   
        } catch (error) {
            setUser(null);
            localStorage.removeItem("access_token");
            return null
        }
        finally{
            setLoading(false)
        }
    };

    const login = async (email, password) => {
        const res = await api.post("/auth/login", { email, password });
        const token = res.data.access_token;

        localStorage.setItem("access_token", token);

        const currentUser = await fetchCurrentUser();
        return currentUser;
    };

    const logout = () => {
        localStorage.removeItem("access_token");
        setUser(null);
    };

    useEffect(()=>{
        const token = localStorage.getItem("access_token");
        if(token){
            fetchCurrentUser();
        }
        else{
            setLoading(false);
        }
    },[]);



    return(
        <Authcontext.Provider value={{user, loading, fetchCurrentUser, login, logout}}>
            {children}
        </Authcontext.Provider>
    );
};


export const useAuth =() => useContext(Authcontext);

