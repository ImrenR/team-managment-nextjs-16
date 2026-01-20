export enum Role{
  ADMIN="ADMIN",
  MANAGER="MANAGER",
  USER="USER",
  GUEST="GUEST",

}

export interface User{
id: string;
name:string;
email:string;
role:Role;
teamId?:string; // when we create the user, the user might not assigned on any team, so optional
team?:Team;
createdAt: Date;
updateAt: Date;

}

export interface Team{
  id:string;
  name:string;
  description?: string | null;
  members:User[];
  createdAt: Date;
  updateAt: Date;
}