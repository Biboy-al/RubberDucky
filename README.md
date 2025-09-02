# RubberDucky

## Problem Statment
They say you truely knowing somthing if you can explain it to someone. Introducing Rubber Ducky an AI powered chat bot where you can try to explain a topic to it, and see if it can understand.

## Features:
- The system records the user, transcribes their words and see if they can understand it.
- There is a dropdown menu where the user can pick the expertise level of the topic you are trying to explain to them



## Requirments

### Functional Requirements
| ID  | Requirement |
|-----|-------------|
| F1  | The system must have a frontend for the user to interact with. |
| F2  | The system must allow users to record their spoken explanation of a topic. |
| F3  | The system must transcribe the recorded audio into text. |
| F4  | The system must analyze the transcription to determine if the explanation is understood. |
| F5  | The system must display a dropdown menu for selecting the expertise level of the topic (e.g., beginner, intermediate, expert). |
| F6  | The system must adjust its understanding feedback based on the selected expertise level. |
| F7  | The system must provide feedback to the user indicating whether it understood the explanation. |

### Non-Functional Requirements 

| ID  | Requirement |
|-----|-------------|
| N1  | The system must transcribe audio input with at least 90% accuracy. |
| N2  | The system must process and return feedback within 3 seconds of receiving the transcription. |
| N3  | The user interface must be intuitive and accessible on both desktop and mobile devices. |
| N4  | The system must securely handle and store user audio recordings and transcriptions to protect privacy. |
| N5  | The dropdown menu for expertise selection must respond within 100 ms of user interaction. |
| N6  | The system should maintain high availability (≥ 99% uptime). |
