//streams.js
// const APP_ID = '428f6fb469774b1c8c426b73ba862224'
const APP_ID = '{{ APP_ID }}'
let CHANNEL = ""
let TOKEN = ""
let UID = ""

let NAME = ""
// let CHANNEL = sessionStorage.getItem('room')
// let TOKEN = sessionStorage.getItem('token')
// let UID = sessionStorage.getItem('UID')

// let NAME = sessionStorage.getItem('name')

const client = AgoraRTC.createClient({
    mode: 'rtc',
    codec: 'vp8'
})

let localTracks = []
let remoteUsers = {}
let screenTrack;
let isScreenSharing = false;

let decodeData = async () => {
    const urlParams = window.location.pathname.split('/');
    const roomToken = urlParams[urlParams.length - 2];

    if (!roomToken) {
        console.error("No roomToken found in the URL.");
        window.open('/', '_self');
        return;
    }

    try {
        const decodedData = atob(roomToken);
        let roomData = JSON.parse(decodedData);

        if (!roomData.room || !roomData.UID) {
            console.error("Decoded data is missing required fields.");
            window.open('/', '_self');
            return;
        }

        CHANNEL = roomData.room;
        TOKEN = roomData.token;
        UID = roomData.UID;

        if (!roomData.name) {
            sessionStorage.setItem('invitedRoom', CHANNEL);
            window.open('/', '_self');
            return;
        }

        NAME = roomData.name;
        let member;
        try {
            let response = await fetch(`/get_member/?UID=${UID}&room_name=${CHANNEL}`)
            member = await response.json()
        } catch (error) {
            console.error("Error fetching member:", error);
            member = null;
        }

        if (member && member.name) {
            console.log("Member already exists");
            window.open('/', '_self');
        }
    } catch (error) {
        console.error("Failed to decode room token or parse JSON:", error);
        window.open('/', '_self');
    }
};

let joinAndDisplayLocalStream = async () => {
    console.log("Join & Display Entered");
    await decodeData();
    document.getElementById('room-name').innerText = CHANNEL;

    client.on('user-published', handleUserJoined)
    client.on('user-left', handleUserLeft)

    if (NAME == "" && CHANNEL) {
        window.open('/', '_self');
        document.getElementById('room-name').innerText = CHANNEL;
        return;
    }

    try {
        await client.join(APP_ID, CHANNEL, TOKEN, UID);
    } catch (error) {
        console.error(error);
        window.open('/', '_self')
    }

    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks()

    let member = await createMember()

    let player = `<div id="user-container-${UID}" class="video-container">
                    <div class="username-wrapper"><span class="user-name">${(member.name).toUpperCase()}</span></div>
                    <div class="video-player" id="user-${UID}"></div>
                </div>`

    document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)

    localTracks[1].play(`user-${UID}`)

    await client.publish([localTracks[0], localTracks[1]])
}

let toggleScreenShare = async (e) => {
    e.target.disabled = true;
    if (!isScreenSharing) {
        try {
            screenTrack = await AgoraRTC.createScreenVideoTrack({
                encoderConfig: "1080p_1",
                screenSourceType: "screen"
            });

            if (localTracks[1]) {
                await client.unpublish(localTracks[1]);
                localTracks[1].stop();
                localTracks[1].close();
            }

            await client.publish(screenTrack);

            let screenPlayer = document.getElementById(`user-container-${UID}`);
            if (!screenPlayer) {
                let response = await fetch(`/get_member/?UID=${UID}&room_name=${CHANNEL}`)
                let member = await response.json()

                screenPlayer = `<div id="user-container-${UID}" class="video-container">
                                    <div class="username-wrapper"><span class="user-name">${member.name}</span></div>
                                    <div class="video-player" id="user-${UID}"></div>
                                </div>`;
                document.getElementById('video-streams').insertAdjacentHTML('beforeend', screenPlayer);
            }
            screenTrack.play(`user-${UID}`);

            isScreenSharing = true;
            e.target.style.backgroundColor = '#ffa500';
        } catch (error) {
            console.error("Error starting screen share:", error);
        }
    } else {
        try {
            if (screenTrack) {
                await client.unpublish(screenTrack);
                screenTrack.stop();
                screenTrack.close();
            }

            localTracks[1] = await AgoraRTC.createCameraVideoTrack();
            await client.publish(localTracks[1]);

            localTracks[1].play(`user-${UID}`);

            isScreenSharing = false;
            e.target.style.backgroundColor = '#fff';
        } catch (error) {
            console.error("Error stopping screen share:", error);
        }
    }
    e.target.disabled = false;
};

let handleUserJoined = async (user, mediaType) => {
    remoteUsers[user.uid] = user;
    await client.subscribe(user, mediaType)

    if (mediaType === 'video') {
        let player = document.getElementById(`user-container-${user.uid}`)
        if (player != null) {
            player.remove()
        }

        let member = await getMember(user)

        player = `<div class="video-container" id="user-container-${user.uid}">
                    <div class="video-player" id="user-${user.uid}"></div>
                    <div class="username-wrapper"><span class="user-name">${member.name}</span></div>
                </div>`
        document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)
        user.videoTrack.play(`user-${user.uid}`)
    }

    if (mediaType === 'audio') {
        user.audioTrack.play()
    }
}

let handleUserLeft = async (user) => {
    delete remoteUsers[user.uid];
    let userContainer = document.getElementById(`user-container-${user.uid}`);
    if (userContainer) {
        userContainer.remove();
    }
}

let leaveAndRemoveLocalStream = async () => {
    for (let i = 0; localTracks.length > i; i++) {
        localTracks[i].stop()
        localTracks[i].close()
    }

    if (screenTrack) {
        screenTrack.stop();
        screenTrack.close();
    }

    await client.leave()
    if (NAME && CHANNEL && UID) {
        await deleteMember();
    }
    window.open('/', '_self')
}

let toggleCamera = async (e) => {
    if (localTracks[1].muted) {
        await localTracks[1].setMuted(false)
        e.target.style.backgroundColor = '#fff'
    } else {
        await localTracks[1].setMuted(true)
        e.target.style.backgroundColor = 'rgb(210,42,42,1)';
    }
}

let toggleMic = async (e) => {
    if (localTracks[0].muted) {
        await localTracks[0].setMuted(false)
        e.target.style.backgroundColor = '#fff'
    } else {
        await localTracks[0].setMuted(true)
        e.target.style.backgroundColor = 'rgb(210,42,42,1)';
    }
}

let createMember = async () => {
    let response = await fetch('/create_member/', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 'name': NAME, 'room_name': CHANNEL, 'UID': UID })
    })

    let member = await response.json()
    return member
}

let getMember = async (user) => {
    let response = await fetch(`/get_member/?UID=${user.uid}&room_name=${CHANNEL}`)
    let member = await response.json()
    return member
}

let deleteMember = async () => {
    let response = await fetch('/delete_member/', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 'name': NAME, 'room_name': CHANNEL, 'UID': UID })
    })

    let member = await response.json()
}

let generateInviteLink = () => {
    if (!CHANNEL || !UID || !TOKEN) {
        alert("Room details are missing. Cannot generate invite link.");
        return null;
    }

    let inviteData = {
        room: CHANNEL,
        UID: UID,
        token: TOKEN
        // Intentionally omitting name
    };

    const inviteToken = btoa(JSON.stringify(inviteData));
    return `${window.location.origin}/room/${inviteToken}/`;
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    joinAndDisplayLocalStream()

    window.addEventListener('beforeunload', deleteMember)

    document.getElementById('leave-btn').addEventListener('click', leaveAndRemoveLocalStream);
    document.getElementById('camera-btn').addEventListener('click', toggleCamera);
    document.getElementById('mic-btn').addEventListener('click', toggleMic);
    document.getElementById('screen-share-btn').addEventListener('click', toggleScreenShare);
    const shareLinkBtn = document.getElementById('share-link-btn');
    const linkDisplayWrapper = document.getElementById('link-display-wrapper');
    const inviteLinkInput = document.getElementById('invite-link');

    shareLinkBtn.addEventListener('click', () => {
        const inviteLink = generateInviteLink();
        if (inviteLink) {
            inviteLinkInput.value = inviteLink;
            linkDisplayWrapper.classList.add('active');

            // Optional: Copy to clipboard
            navigator.clipboard.writeText(inviteLink)
                .then(() => {
                    shareLinkBtn.classList.add('copied');
                    setTimeout(() => {
                        shareLinkBtn.classList.remove('copied');
                    }, 2000);
                })
                .catch(err => {
                    console.error('Failed to copy invite link', err);
                });
        }
    });

    // Close link display when clicking outside
    document.addEventListener('click', (event) => {
        if (!linkDisplayWrapper.contains(event.target) &&
            event.target !== shareLinkBtn &&
            !shareLinkBtn.contains(event.target)) {
            linkDisplayWrapper.classList.remove('active');
        }
    });



    document.getElementById('copy-link-btn').addEventListener('click', () => {
        const inviteLinkInput = document.getElementById('invite-link');
        inviteLinkInput.select();
        navigator.clipboard.writeText(inviteLinkInput.value)
            .then(() => {
                const copyBtn = document.getElementById('copy-link-btn');
                copyBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyBtn.textContent = 'Copy';
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy invite link', err);
            });
    });
});