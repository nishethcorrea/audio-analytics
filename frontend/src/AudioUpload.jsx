import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  TableContainer,
  Paper,
  TableRow,
  Table,
  TableHead,
  TableCell,
  TableBody,
  CircularProgress,
  withStyles,
  Button,
} from "@material-ui/core";
import { Clear } from "@material-ui/icons";
import { common } from "@material-ui/core/colors";
import { DropzoneArea } from "material-ui-dropzone";
import ReactAudioPlayer from "react-audio-player";
import { useState, useEffect } from "react";
import axios from "axios";

const ColorButton = withStyles((theme) => ({
  root: {
    color: theme.palette.getContrastText(common.white),
    backgroundColor: common.white,
    "&:hover": {
      backgroundColor: "#ffffff7a",
    },
  },
}))(Button);

const AudioUpload = () => {
  const [file, setFile] = useState(false);
  const [data, setData] = useState();
  const [audio, setAudio] = useState();
  const [isLoading, setIsloading] = useState(false);
  const [preview, setPreview] = useState();
  let confidence_g = 0;
  let confidence_e = 0;
  let confidence_a = 0;

  const sendFile = async () => {
    if (file) {
      let formData = new FormData();
      formData.append("file", audio);
      let res = await axios({
        method: "post",
        url: "http://localhost:8000/predict",
        data: formData,
      });
      if (res.status === 200) {
        setData(res.data);
      }
      setIsloading(false);
    }
  };

  const addFile = (files) => {
    if (!files || files.length === 0) {
      setAudio(undefined);
      setFile(false);
      setData(undefined);
      return;
    }
    if (files[0]) {
      setAudio(files[0]);
      setData(undefined);
      setFile(true);
    }
  };

  useEffect(() => {
    if (!audio) {
      setPreview(undefined);
      return;
    }
    const objectUrl = URL.createObjectURL(audio);
    setPreview(objectUrl);
  }, [audio]);

  useEffect(() => {
    if (!preview) {
      return;
    }
    setIsloading(true);
    sendFile();
  }, [preview]);

  const clearData = () => {
    setData(null);
    setFile(false);
    setAudio(null);
    setPreview(null);
  };

  if (data) {
    confidence_g = (parseFloat(data.confidence_g) * 100).toFixed(2);
    confidence_e = (parseFloat(data.confidence_e) * 100).toFixed(2);
    confidence_a = (parseFloat(data.confidence_a) * 100).toFixed(2);
  }

  return (
    <>
      <AppBar position="static" className="appbar">
        <Toolbar className="tool">
          <Typography className="typography">
            AUDIO ANALYTICS: DETERMINE GENDER, AGE AND EMOTION
          </Typography>
        </Toolbar>
      </AppBar>
      <Toolbar className="tool1">
        <Typography className="typography1">
          This Model will determine the gender, age and emotion of a person by
          analysing the audio. The audio file should be in{" "}
          <strong>&quot;.wav&quot;</strong> format.
        </Typography>
      </Toolbar>
      <Container
        maxWidth={false}
        className="main-container"
        disableGutters={true}
      >
        <Grid
          className="grid-container"
          container
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={2}
        >
          <Grid item xs={12}>
            <Card className={"audioCard " + (!file && "audioCardEmpty")}>
              {!file && (
                <CardContent>
                  <DropzoneArea
                    acceptedFiles={["audio/*"]}
                    dropzoneText={"Drag and drop an audio file to process"}
                    onChange={addFile}
                  />
                </CardContent>
              )}
              {data && (
                <CardContent className="detail">
                  <TableContainer component={Paper} className="table-container">
                    <TableRow align="center">
                      <ReactAudioPlayer
                        src={URL.createObjectURL(audio)}
                        autoPlay
                        controls
                      />
                    </TableRow>
                    <Table
                      className="table"
                      size="small"
                      aria-label="simple table"
                    >
                      <TableHead className="table-head">
                        <TableRow className="table-row">
                          <TableCell className="table-cell">Gender:</TableCell>
                          <TableCell align="right" className="table-cell">
                            Confidence:
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody className="table-body">
                        <TableRow className="table-row">
                          <TableCell
                            component="th"
                            scope="row"
                            className="table-cell1"
                          >
                            {data.Gender}
                          </TableCell>
                          <TableCell align="right" className="table-cell1">
                            {confidence_g}%
                          </TableCell>
                        </TableRow>
                      </TableBody>
                      <TableHead className="table-head">
                        <TableRow className="table-row">
                          <TableCell className="table-cell">Age:</TableCell>
                          <TableCell align="right" className="table-cell">
                            Confidence:
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody className="table-body">
                        <TableRow className="table-row">
                          <TableCell
                            component="th"
                            scope="row"
                            className="table-cell1"
                          >
                            {data.Age}
                          </TableCell>
                          <TableCell align="right" className="table-cell1">
                            {confidence_a}%
                          </TableCell>
                        </TableRow>
                      </TableBody>
                      <TableHead className="table-head">
                        <TableRow className="table-row">
                          <TableCell className="table-cell">Emotion:</TableCell>
                          <TableCell align="right" className="table-cell">
                            Confidence:
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody className="table-body">
                        <TableRow className="table-row">
                          <TableCell
                            component="th"
                            scope="row"
                            className="table-cell1"
                          >
                            {data.Emotion}
                          </TableCell>
                          <TableCell align="right" className="table-cell1">
                            {confidence_e}%
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              )}
              {isLoading && (
                <CardContent className="detail">
                  <CircularProgress color="secondary" className="loader" />
                  <Typography variant="h6" noWrap>
                    Processing
                  </Typography>
                </CardContent>
              )}
            </Card>
          </Grid>
          {data && (
            <Grid item className="button-grid">
              <ColorButton
                variant="contained"
                className="clear-button"
                color="primary"
                component="span"
                size="large"
                onClick={clearData}
                startIcon={<Clear fontSize="large" />}
              >
                Clear
              </ColorButton>
            </Grid>
          )}
        </Grid>
      </Container>
    </>
  );
};

export default AudioUpload;
