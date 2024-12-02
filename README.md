# MILAN Video Chat App Project 🚀

Welcome to MILAN! This project is a video chat application built using Django and Agora SDK. It allows users to create and join video chat rooms with ease.


## Screenshots 📸

### Lobby
![Lobby Interface](https://res.cloudinary.com/sakshamtolani/image/upload/v1733136657/aof3jmalwvggetyheyo0.png)
*The lobby where users can create or join rooms*

### Video Call
![Video Call Interface](https://res.cloudinary.com/sakshamtolani/image/upload/v1733136657/aof3jmalwvggetyheyo0.png)
*Active video call session with multiple participants*

## Features ✨

- Create and join video chat rooms
- Real-time video and audio streaming
- Screen sharing capability 
- Toggle camera and microphone
- Generate shareable invite links
- Role-based access (Host/Audience)
- Responsive design for mobile devices

## Backend API Endpoints 🛠️

The backend server provides the following API endpoints:

- `GET /get_token/`: Generates a token for a user to join a video chat room
- `GET /get_room/`: Checks if a room exists
- `POST /create_member/`: Creates a new room member
- `GET /get_member/`: Retrieves member details
- `POST /delete_member/`: Deletes a room member

## Technologies Used 🛠️

- **Backend**
  - Django
  - Agora SDK
  - SQLite Database
  - Python dotenv

- **Frontend** 
  - JavaScript
  - HTML5
  - CSS3
  - Agora RTC Client

## Prerequisites 📋

Before running this project, make sure you have:

- Python 3.6+
- Django 4.1+
- Agora.io account with:
  - App ID
  - App Certificate

## Installation & Setup 🔧

1. Clone the repository
```bash
git clone https://github.com/yourusername/milan.git
cd milan
```
2. Install dependencies
```bash
pip install -r requirements.txt
```

3. Create a `.env` file in the project root and add your Agora credentials:
- APP_ID = 'your_app_id'
- APP_CERTIFICATE = 'your_app_certificate'

4. Run migrations
```bash
python manage.py migrate
```
5. Start the development server
```bash
python manage.py runserver
```


The application will be available at `http://127.0.0.1:8000/`

## Usage 💡

1. **Creating a Room**
   - Visit the homepage
   - Click on "Create Room" tab
   - Enter room name and your display name
   - Click "Create Stream"

2. **Joining a Room**
   - Visit the homepage
   - Click on "Join Room" tab
   - Enter existing room name and your display name
   - Click "Join Stream"

3. **In-Room Controls**
   - Toggle camera 🎥
   - Toggle microphone 🎤
   - Share screen 💻
   - Share invite link 🔗
   - Leave room ❌

## Project Structure 📁

```
milan/
├── base/                  # Main Django app
│   ├── models.py         # Database models
│   ├── views.py         # View controllers
│   ├── urls.py          # URL routing
│   └── templates/       # HTML templates
├── static/               # Static files
│   ├── styles/         # CSS files
│   ├── js/            # JavaScript files
│   └── images/        # Image assets
├── videochatapp/        # Project settings
├── manage.py           # Django management script
└── requirements.txt    # Project dependencies
```

## Contributing 🤝

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License 📝

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments 🙏

- [Agora.io](https://www.agora.io/) for their excellent video SDK
- [Django](https://www.djangoproject.com/) for the amazing web framework

## Support 💬

For support, email your-email@example.com or create an issue in this repository.

---

Made with ❤️ by [Saksham Tolani](https://github.com/yourusername)

🌟 Don't forget to star this repo if you found it helpful!
