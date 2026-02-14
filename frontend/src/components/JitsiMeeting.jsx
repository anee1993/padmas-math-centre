import { useEffect, useRef } from 'react';

const JitsiMeeting = ({ roomName, displayName, isModerator, onClose }) => {
  const jitsiContainerRef = useRef(null);
  const jitsiApi = useRef(null);

  useEffect(() => {
    if (!window.JitsiMeetExternalAPI) {
      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      script.onload = () => initializeJitsi();
      document.body.appendChild(script);
    } else {
      initializeJitsi();
    }

    return () => {
      if (jitsiApi.current) {
        jitsiApi.current.dispose();
      }
    };
  }, []);

  const initializeJitsi = () => {
    const domain = '8x8.vc';
    
    const options = {
      roomName: roomName,
      width: '100%',
      height: '100%',
      parentNode: jitsiContainerRef.current,
      userInfo: {
        displayName: displayName,
        email: isModerator ? 'teacher@mathtuition.com' : undefined,
      },
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        prejoinPageEnabled: false,
        disableDeepLinking: true,
        enableWelcomePage: false,
        enableClosePage: false,
        defaultLanguage: 'en',
        // Completely disable lobby/waiting room
        enableLobbyChat: false,
        enableInsecureRoomNameWarning: false,
        // Allow anyone to join without waiting
        requireDisplayName: false,
        // Conference settings
        hideConferenceSubject: false,
        subject: `Padma's Math Centre - ${roomName}`,
        // Disable all security features that might cause waiting
        disableModeratorIndicator: false,
        startSilent: false,
        // Toolbar configuration - all buttons available
        toolbarButtons: [
          'camera',
          'chat',
          'closedcaptions',
          'desktop',
          'download',
          'embedmeeting',
          'etherpad',
          'feedback',
          'filmstrip',
          'fullscreen',
          'hangup',
          'help',
          'highlight',
          'invite',
          'microphone',
          'mute-everyone',
          'mute-video-everyone',
          'participants-pane',
          'profile',
          'raisehand',
          'recording',
          'security',
          'select-background',
          'settings',
          'shareaudio',
          'sharedvideo',
          'shortcuts',
          'stats',
          'tileview',
          'toggle-camera',
          'videoquality',
          'whiteboard'
        ],
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        SHOW_BRAND_WATERMARK: false,
        BRAND_WATERMARK_LINK: '',
        SHOW_POWERED_BY: false,
        DISPLAY_WELCOME_PAGE_CONTENT: false,
        DISPLAY_WELCOME_PAGE_TOOLBAR_ADDITIONAL_CONTENT: false,
        APP_NAME: "Padma's Math Centre",
        NATIVE_APP_NAME: "Padma's Math Centre",
        PROVIDER_NAME: "Padma's Math Centre",
        MOBILE_APP_PROMO: false,
        // Disable any lobby-related UI
        ENABLE_LOBBY_CHAT: false,
        // Show all toolbar buttons
        TOOLBAR_BUTTONS: [
          'camera',
          'chat',
          'closedcaptions',
          'desktop',
          'download',
          'embedmeeting',
          'etherpad',
          'feedback',
          'filmstrip',
          'fullscreen',
          'hangup',
          'help',
          'highlight',
          'invite',
          'microphone',
          'mute-everyone',
          'mute-video-everyone',
          'participants-pane',
          'profile',
          'raisehand',
          'recording',
          'security',
          'select-background',
          'settings',
          'shareaudio',
          'sharedvideo',
          'shortcuts',
          'stats',
          'tileview',
          'toggle-camera',
          'videoquality',
          'whiteboard'
        ],
      },
    };

    jitsiApi.current = new window.JitsiMeetExternalAPI(domain, options);

    // Event listeners
    jitsiApi.current.addListener('videoConferenceJoined', () => {
      console.log('User joined the conference');
      
      // If moderator (teacher), grant moderator rights
      if (isModerator) {
        console.log('Teacher joined as moderator');
        // Execute moderator commands
        jitsiApi.current.executeCommand('toggleLobby', false);
      }
    });

    jitsiApi.current.addListener('videoConferenceLeft', () => {
      console.log('User left the conference');
      if (onClose) onClose();
    });

    jitsiApi.current.addListener('readyToClose', () => {
      if (onClose) onClose();
    });
    
    // Additional event to handle participant joining
    jitsiApi.current.addListener('participantJoined', (participant) => {
      console.log('Participant joined:', participant);
    });
  };

  return (
    <div className="w-full h-full">
      <div ref={jitsiContainerRef} className="w-full h-full" />
    </div>
  );
};

export default JitsiMeeting;
