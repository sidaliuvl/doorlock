const app = Vue.createApp({
    data() {
        return {
            coords: "",
            heading: "",
            hash: "",
            doorlockStyleObject: {
                "display": "none"
            },
            doorlockClassObject: {
                "slide_in": false,
                "slide_out": false
            },
            doorText: "",
            doorAuthorized: false,
            doorKey: "E"
        }
    },
    mounted() {
        this.listener = window.addEventListener("message", (event) => {
            switch (event.data.type) {
                case "setText":
                    this.setText(event.data);
                    break;
                case "setDoorText":
                    this.setDoorText(event.data);
                    break;
                case "audio":
                    this.playAudio(event.data);
                    break;
                default:
                    break;
            }
        });

        // Test function for debugging - remove in production
        this.setupTestControls();
    },
    beforeUnmount() {
        if (this.listener) {
            window.removeEventListener("message", this.listener);
        }
    },
    methods: {
        setText(data) {
            if (data.aim !== undefined) {
                const element = document.getElementById("aim");
                if (element) {
                    element.style.display = data.aim;
                }
            }

            if (data.details !== undefined) {
                this.coords = data.coords || "";
                this.heading = data.heading || "";
                this.hash = data.hash || "";
                const element = document.getElementById("textDetails");
                if (element) {
                    element.style.display = data.details;
                }
            }
        },
        setDoorText(data) {
            console.log("setDoorText called with:", data); // Debug log

            if (data.enable) {
                // Show the door lock UI
                if (this.doorlockStyleObject["display"] === "none") {
                    this.doorlockClassObject["slide_in"] = true;
                    this.doorlockClassObject["slide_out"] = false;
                    this.doorlockStyleObject["display"] = "flex";
                }

                // Set door properties with proper type checking
                this.doorText = data.text || "";
                this.doorAuthorized = Boolean(data.authorized);
                this.doorKey = data.key || 'E';

                console.log("Door state updated:", {
                    text: this.doorText,
                    authorized: this.doorAuthorized,
                    key: this.doorKey
                }); // Debug log

            } else {
                // Hide the door lock UI
                this.doorlockClassObject["slide_in"] = false;
                this.doorlockClassObject["slide_out"] = true;

                setTimeout(() => {
                    this.doorlockStyleObject["display"] = "none";
                    this.doorlockClassObject["slide_out"] = false;
                    this.doorText = "";
                    this.doorAuthorized = false;
                    this.doorKey = "E";
                }, 300); // Reduced timeout to match CSS animation
            }
        },
        playAudio(data) {
            try {
                var volume = (data.audio['volume'] / 10) * data.sfx;
                if (volume > 1.0) volume = 1.0;
                if (data.distance !== 0) volume /= data.distance;
                const sound = new Audio('sounds/' + data.audio['file']);
                sound.volume = volume;
                sound.play();
            } catch (error) {
                console.error("Audio playback error:", error);
            }
        },
        // Test function for debugging - remove in production
        setupTestControls() {
            // Add keyboard controls for testing
            document.addEventListener('keydown', (event) => {
                if (event.key === 'l' || event.key === 'L') {
                    // Test locked state
                    this.setDoorText({
                        enable: true,
                        text: "Door is locked",
                        authorized: false,
                        key: "E"
                    });
                } else if (event.key === 'u' || event.key === 'U') {
                    // Test unlocked state
                    this.setDoorText({
                        enable: true,
                        text: "Door is unlocked",
                        authorized: true,
                        key: "E"
                    });
                } else if (event.key === 'h' || event.key === 'H') {
                    // Hide door lock
                    this.setDoorText({
                        enable: false
                    });
                }
            });

            console.log("Test controls enabled:");
            console.log("Press 'L' to show locked door");
            console.log("Press 'U' to show unlocked door");
            console.log("Press 'H' to hide door lock");
        }
    }
}).mount('#mainContainer');