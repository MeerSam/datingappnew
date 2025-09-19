export type User = {
    id: string;
    displayName: string;
    email: string;
    token: string;
    imageUrl?: string;

}
// you could the same with interface  export interface User

export  type LoginCreds={
    email:string;
    password:string;
}

export type RegisterCreds = {
    email:string;
    displayName: string;
    password:string;
    gender: string;
    dateOfBith : string;
    city: string;
    country:string;
}