import { Box, Button, Paper, Typography } from '@mui/material'
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import React from 'react'
import { AppState } from '../../context/ContextProvider'
import Axios  from 'axios';


function Cards() {
    const { thememode } = AppState()


    const downloadHandler=()=>
    {
        const id=localStorage.getItem("userstore");
        const uid=JSON.parse(id);
        // const uname1=uid.username;
        const uname1="vini4@gmail.com";
        console.log(uname1);
        Axios.post('/fileget',{file_name:uname1}).then(res=>{
            fetch(`${uname1}.pdf`).then(response => {
              response.blob().then(blob => {
                  // Creating new object of PDF file
                  const fileURL = window.URL.createObjectURL(blob);
                  // Setting various property values
                  let alink = document.createElement('a');
                  alink.href = fileURL;
                  alink.download = `${uname1}.pdf`;
                  alink.click();
              })
            Axios.post('/clearfile',{file_name:uname1}).then(res=>{console.log(res);}).catch((err)=>{console.log(err);});
          }).catch(err=>{console.log(err);});
            console.log(res);
          }).catch((err)=>{console.log(err);});

    }

    return (
        <>

{/* --------------------------------Card I----------------------------------- */}

            <Paper id="slideFromBottomAnim" elevation={6} sx={{
                display: "flex",
                flexDirection: "column",
                color: thememode ? "#afafaf" : "#43464a",
                background: thememode ? "#101534" : "#d9d9d9",
                borderRadius: "6px", padding: "inherit",
                width: "13rem",
                height: "20rem",
                marginTop:"1rem"
            }}>

                <Box sx={{
                    background: thememode ? "#0e122c" : "#bdbdbd",
                    marginBottom: "1rem",
                    height: "5rem",
                    width: "9rem",
                    borderRadius: "6px", padding: "inherit"
                }}>

                </Box>

                <Box sx={{ wordWrap: "break-word" }} >
                    <Typography variant="h4" component="h2">
                        Offer Letter
                    </Typography>
                    <Typography margin={3} variant="p" component="p">
                        Please download your Offer Letter from here...
                    </Typography>
                </Box>

                <Box display={"flex"} justifyContent={"center"} sx={{ width: "100%" }}><Button
                    startIcon={<CloudDownloadIcon />} 
                    style={{
                        background:"#7b1fa2",
                        width: "70%",
                        borderRadius: "7px", height: "3rem", color: "white",
                    }} variant="contained"  onClick={downloadHandler}>Download</Button>
                </Box>

            </Paper>

{/* ------------------------------CARD II ------------------------------ */}

            <Paper id="slideFromBottomAnim" elevation={6} sx={{
                display: "flex",
                flexDirection: "column",
                color: thememode ? "#afafaf" : "#43464a",
                background: thememode ? "#101534" : "#d9d9d9",
                borderRadius: "6px", padding: "inherit",
                width: "13rem",
                height: "20rem",
                marginTop:"1rem"
            }}>

                <Box sx={{ wordWrap: "break-word" }} >
                    <Typography variant="h4" component="h2">
                    Internship Completion Certificate
                    </Typography>
                    <Typography margin={3} variant="p" component="p">
                    Please download your Internship Completion Certificate from here...
                    </Typography>
                </Box>

                <Box display={"flex"} justifyContent={"center"} sx={{ width: "100%" }}><Button
                    startIcon={<CloudDownloadIcon />} 
                    style={{
                        background:"#7b1fa2",
                        width: "70%",
                        borderRadius: "7px", height: "3rem", color: "white",
                    }} variant="contained" >Download</Button>
                </Box>

            </Paper>


{/* --------------------------------- Card III ------------------------------- */}

            <Paper id="slideFromBottomAnim" elevation={6} sx={{
                display: "flex",
                flexDirection: "column",
                color: thememode ? "#afafaf" : "#43464a",
                background: thememode ? "#101534" : "#d9d9d9",
                borderRadius: "6px", padding: "inherit",
                width: "13rem",
                height: "20rem",
                marginTop:"1rem"
            }}>

                <Box sx={{ wordWrap: "break-word" }} >
                    <Typography variant="h4" component="h2">
                    Letter Of Recommendation
                    </Typography>
                    <Typography margin={3} variant="p" component="p">
                    Please download your Letter Of Recommendation from here...
                    </Typography>
                </Box>

                <Box display={"flex"} justifyContent={"center"} sx={{ width: "100%" }}><Button
                    startIcon={<CloudDownloadIcon />} 
                    style={{
                        background:"#7b1fa2",
                        width: "70%",
                        borderRadius: "7px", height: "3rem", color: "white",
                    }} variant="contained" >Download</Button>
                </Box>

            </Paper>

        </>
    )
}

export default Cards