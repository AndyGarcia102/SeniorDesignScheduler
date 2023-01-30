import {useContext, useState} from 'react';

// When register is created, we needto call AuthProvider function
import { AuthContext } from '../context/authContext'; 
import {useForm} from "../utility/hooks";
import {useMutation} from "@apollo/react-hooks";
import {gql} from 'graphql-tag';
import { Navigate, useNavigate } from 'react-router-dom';
import {TextField, Button, Container, Stack, Alert, AlertTitle} from "@mui/material";
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import CustomSidebar from '../components/Sidebar';
import "../components/css/student.css";

function Student(props){

    // user data lives in here 
    const {user,logout} = useContext(AuthContext);
    let navigate = useNavigate();

    var year = new Date().getFullYear()


    console.log("user data:: ----------------");
    console.log(user);

    if(user.email === undefined){
        navigate('/');
    }

    return (
        <div className='studentPage'>
            <CustomSidebar/>
            <div className="userInfo">
                <p style={{textAlign:"left", margin:0}}>{user.email}</p>
                <p style={{textAlign:"left", margin:0}}>{user.firstname}</p>
                <p style={{textAlign:"left", margin:0}}>{user.lastname}</p>
                <p style={{textAlign:"left", margin:0}}>{year}</p>
            </div>

        </div>

    )
}

export default Student