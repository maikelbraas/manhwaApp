import 'https://cdn.jsdelivr.net/gh/orestbida/cookieconsent@3.0.1/dist/cookieconsent.umd.js';

// Enable dark mode
document.documentElement.classList.add('cc--darkmode');

CookieConsent.run({
    guiOptions: {
        consentModal: {
            layout: "bar inline",
            position: "bottom",
            equalWeightButtons: true,
            flipButtons: false
        },
        preferencesModal: {
            layout: "box",
            position: "right",
            equalWeightButtons: true,
            flipButtons: false
        }
    },
    categories: {
        necessary: {
            readOnly: true
        },
        functionality: {
            services: {
                db: {
                    label: 'dateBuild',
                    onAccept: () => {
                        true
                    },
                    onReject: () => {
                        false
                    }
                },
                nb: {
                    label: 'newBuild',
                    onAccept: () => {
                        true
                    },
                    onReject: () => {
                        false
                    }
                }
            }
        }
    },
    language: {
        default: "en",
        autoDetect: "browser",
        translations: {
            en: {
                consentModal: {
                    title: "Hello traveller, it's cookie time!",
                    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip.",
                    acceptAllBtn: "Accept all",
                    acceptNecessaryBtn: "Reject all",
                    showPreferencesBtn: "Manage preferences",
                    footer: "<a href=\"#link\">Privacy Policy</a>\n<a href=\"#link\">Terms and conditions</a>"
                },
                preferencesModal: {
                    title: "Consent Preferences Center",
                    acceptAllBtn: "Accept all",
                    acceptNecessaryBtn: "Reject all",
                    savePreferencesBtn: "Save preferences",
                    closeIconLabel: "Close modal",
                    serviceCounterLabel: "Service|Services",
                    sections: [
                        {
                            title: "Cookie Usage",
                            description: "The cookies that are used are purely for the functionality of the website.<br><a href='/cookiepolicy'>View cookie policy</a> <br><a href='/privacypolicy'>View privacy policy</a>"
                        },
                        {
                            title: "NodeJS <span class=\"pm__badge\">Always Enabled</span>",
                            description: "This cookie is for the tracking of the amound of users that come to the website and for the user login.",
                            linkedCategory: "necessary"
                        },
                        {
                            title: "Search Manhwas",
                            description: "These cookies are used for the search functinality in the website. It populates the local storage with manhwas, and updates the local storage when new manhwas/updates are added. dateBuild populates it initially and newBuild creates the new build when needed.",
                            linkedCategory: "functionality"
                        },
                        {
                            title: "More information",
                            description: "For any query in relation to my policy on cookies and your choices, please contact me at manhwasaver@gmail.com"
                        }
                    ]
                }
            }
        }
    },
});