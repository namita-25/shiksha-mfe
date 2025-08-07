import React from "react";
import { PieChart, Pie, Cell, Legend } from "recharts";
import { Card, CardContent, Typography, Box } from "@mui/material";

interface PieChartComponentProps {
  title: string;
  data: { name: string; value: number; color?: string }[];
}

const ageGroups = [
  { name: "Below 18", color: "#FFC107" },
  { name: "18 & Above", color: "#6200EE" },
];

const genderColors = {
  Male: "#EE6002",
  Female: "#26A69A",
};

const processAgeData = (data: { name: string; value: number }[]) => {
  return data.map((entry) => {
    const age = parseInt(entry.name);
    let group = ageGroups.find(({ name }) => {
      if (name === "Below 18") return age < 18;
      return age >= 18;
    });
    return { ...entry, color: group?.color || "#000", name: group?.name || entry.name };
  });
};

const processGenderData = (data: { name: string; value: number }[]) => {
  return data.map((entry) => ({
    ...entry,
    color: genderColors[entry.name as keyof typeof genderColors] || "#000",
  }));
};

const PieChartComponent: React.FC<PieChartComponentProps> = ({ title, data }) => {
  const processedData = title === "Age" ? processAgeData(data) : processGenderData(data);

  return (
    <Card sx={{ width: 350, margin: 2, padding: 2, backgroundColor: "#f8efe6", borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <PieChart width={300} height={250}>
          <Pie data={processedData} cx={150} cy={100} outerRadius={80} dataKey="value">
            {processedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
        {title === "Age" && (
          <Box>
            <Typography variant="subtitle1">Age Group Colors:</Typography>
            {ageGroups.map(({ name, color }) => (
              <Box key={name} display="flex" alignItems="center">
                <Box sx={{ width: 20, height: 20, backgroundColor: color, marginRight: 1 }} />
                <Typography>{name}</Typography>
              </Box>
            ))}
          </Box>
        )}
        {title === "Gender" && (
          <Box>
            <Typography variant="subtitle1">Gender Colors:</Typography>
            {Object.entries(genderColors).map(([name, color]) => (
              <Box key={name} display="flex" alignItems="center">
                <Box sx={{ width: 20, height: 20, backgroundColor: color, marginRight: 1 }} />
                <Typography>{name}</Typography>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PieChartComponent;
