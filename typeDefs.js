const {gql} = require('apollo-server-express');

const typeDefs = gql`

scalar DateTime

    type Admin {
        _id:ID!
        firstname: String 
        lastname: String 
        email: String 
        password: String 
        confirmpassword: String 
        privilege: String 
        confirm: Int 
        token: String 
        image: String
        role: String
    }

    type Coordinator {
        _id:ID!
        firstname: String
        lastname: String
        email: String
        password: String
        confirmpassword: String
        privilege: Int
        confirm: Int
        token: String
        image: String
        groups: [Group]
        schedule: [DateTime]
    }

    type Users {
        _id:ID!
        firstname: String
        lastname: String
        email: String
        password: String
        confirmpassword: String
        group: String
        privilege: Int
        confirm: Int
        role: String
        token: String
        image: String
    }

    type Professors {
        _id:ID!
        firstname: String
        lastname: String
        email: String
        password: String
        privilege: Int
        fieldOfInterest:String
        confirm: Int
        token: String
        schedule: [DateTime]
        appointments: [Appointments]
        reqeusts: [ID]
        image:String
        coordinator: Boolean
        groups: [Group]
    }

    type Appointments {
        date: DateTime 
        groupID: ID 
    }

    type Schedule {
        time: [DateTime]
        groupname: String
    }

    type Group {
        _id:ID!
        coordinatorId:ID
        groupName: String
        projectField: String
        memberCount: Int
        members: [Users!]!
        appointments: [Appointments]
    } 
    
    input UserInput {
        firstname: String
        lastname: String
        email: String
        password: String
        group: String
    }

    input ProfessorRequestInput{
        Request:ID!
    }

    input appointInput{
        firstname: String
        lastname: String
    }
    
    input ProfessorInput {
        firstname: String
        lastname: String
        email: String
        password: String
        fieldOfInterest:String
        coordinator: Boolean
    }

    input ProfessorScheduleInput {
        time: DateTime
    }

    input addToGroup {
        id:ID
        groupname: String
    }

    input RegisterInput {
        firstname: String
        lastname: String
        email: String
        password: String
        confirmpassword: String
    }

    input loginInput {
        email: String
        password: String
    }

    input confirmEmail {
        email: String
    }

    input resetPassword {
        email:String
        password:String
        confirmPassword: String
    }

    input groupInfo {
        coordinatorId: ID
        groupName: String
        projectField: String 
    }

    input groupSchedule {
        appointmentTime: DateTime

    }

    input coordinatorInput {
        firstname: String
        lastname: String
        email: String
        password: String
        confirmpassword: String
    }

    type Query {
        getUser(ID:ID!) : Users!
        getProfessor(ID:ID!) : Professors!
        getAllProfessors : [Professors!]
        getAllUsers :[Users!]
        getAllGroups :[Group!]
        getAdmins : Admin!
    }

    type Mutation {
        createProfessorSchedule(ID:ID!,professorScheduleInput:ProfessorScheduleInput):Boolean
        deleteUser(ID:ID!):Users!
        deleteProfessor(ID:ID!):Professors!
        editUser(ID:ID!, userInput:UserInput):Users! 
        editProfessor(ID:ID!, professorInput:ProfessorInput):Professors!
        registerUser(registerInput: RegisterInput) : Users
        loginUser(loginInput: loginInput): Users
        confirmEmail(confirmEmail: confirmEmail):Boolean
        resetPassword(resetPassword: resetPassword):Boolean
        addGroupMember(addToGroup:addToGroup): Boolean
        createGroup(groupInfo: groupInfo): Group
        createGroupSchedule(groupSchedule: groupSchedule): Boolean
<<<<<<< HEAD
        addProfessorRequest(ID:ID!,ProfessorRequestInput:ProfessorRequestInput):Boolean
        resolveProfessorRequest(ID:ID!,ProfessorRequestInput:ProfessorRequestInput):Boolean
=======
        registerCoordinator(coordinatorInput: coordinatorInput) : Coordinator
>>>>>>> master
    }
`

module.exports = typeDefs;