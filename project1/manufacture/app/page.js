"use client";
import UtliAllBarChart from "@/component/Util/UtilAllBarChart";
import UtliMachineBarChart from "@/component/Util/UtilMachineBarChart";
import { Grid } from "@mui/material";
import { useState } from "react";

const Home = () => {
  const [machineController, setMachineController] = useState('AOI')

  return (
    <div>
      <Grid container spacing={2}>
        <Grid size={12}>
          <UtliAllBarChart setMachineController={setMachineController}></UtliAllBarChart>
        </Grid>
        <Grid size={6}>
          <UtliMachineBarChart machineController={machineController}></UtliMachineBarChart>
        </Grid>
        <Grid size={6}>
          empty
        </Grid>
      </Grid>
    </div>
  );
};

export default Home;
