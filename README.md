# audio-analytics

Web based Age, Gender and Emotion detector

React + Vite, Python + FastAPI

## Clone from Github

```bash
git clone https://github.com/nishethcorrea/audio-analytics.git
```

## Installing Dependencies, packages, modules

Make sure you have installed node and python.

```bash
#install necessary packages and modules using pip ---I have specified some of them. When running your app, if error comes, make sure to install necessary packages/modules
pip install pandas fastapi uvicorn python-multipart numpy librosa resampy
```

```bash
#cd over to the directory frontend
cd frontend

#use the following command to install the dependencies
npm i

#also make sure to run:
npm i @material-ui/core @material-ui/icons axios material-ui-dropzone react-audio-player --legacy-peer-deps
```

## Run the server and frontend

To run the server, run main.py

Then start frontend:

```bash
cd frontend
npm run dev
```

App will run at: [http://localhost:5173](http://localhost:5173)
