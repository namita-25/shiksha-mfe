import { Card, CardContent, Typography, List, ListItem, ListItemText } from "@mui/material"
import React from "react";
interface UserData {
    gender: string;
    age: number;
    name?:string
  }
  interface ParticipantsListProps {
    users: UserData[];
  }

  const ParticipantsList: React.FC<ParticipantsListProps> = ({ users }) => (
    <Card sx={{ width: 300, margin: 2, padding: 2, backgroundColor: "#f8efe6", borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Participant Names
        </Typography>
        <List>
          {users.map((user, index) => (
            <ListItem key={index} divider>
              <ListItemText primary={ user.name?user.name?.charAt(0).toUpperCase() + user?.name?.slice(1) :"" } />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
  export default ParticipantsList;
