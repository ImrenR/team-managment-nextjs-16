export enum Role {

USER="USER",
GUEST="GUEST",
MANAGER="MANAGER",
ADMIN="ADMIN",
};

export interface User {
  id: string,
  name: string,
  email: string,
  role:Role,
  teamId?: string,
  team:Team,
  createdAt: Date,
  updatedAt: Date,
}

export interface Team{
id:string,
name:string,
description?:string,
code:string,
members: User[],
createdAt: Date,
updatedAt: Date,
}