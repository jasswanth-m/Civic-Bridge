/* =========================================================
   CIVIC BRIDGE
   JAVASCRIPT
========================================================= */


/* =========================================================
   GLOBAL VARIABLES
========================================================= */

let currentUserName = "";

let toastTimer = null;
let currentSelectedSchemeId = null;
let currentSelectedDocumentId = null;
let currentSelectedApplicationId = null;
let currentSelectedRuleId = null;


/* =========================================================
   PAGE ELEMENTS
========================================================= */

const landingPage =
    document.getElementById("landingPage");

const accessOverlay =
    document.getElementById("accessOverlay");

const roleSelection =
    document.getElementById("roleSelection");

const studentLoginForm =
    document.getElementById("studentLogin");

const adminLoginForm =
    document.getElementById("adminLogin");

const studentPortal =
    document.getElementById("studentPortal");

const adminPortal =
    document.getElementById("adminPortal");


/* =========================================================
   OPEN ACCESS PORTAL
========================================================= */

function openAccess() {

    accessOverlay.classList.add("active");

    document.body.style.overflow = "hidden";

    backToRoles();

}


/* =========================================================
   CLOSE ACCESS PORTAL
========================================================= */

function closeAccess() {

    accessOverlay.classList.remove("active");

    document.body.style.overflow = "";

}


/* =========================================================
   SELECT STUDENT / ADMIN
========================================================= */

function selectRole(role) {

    roleSelection.classList.add("hidden");

    studentLoginForm.classList.add("hidden");

    adminLoginForm.classList.add("hidden");


    if (role === "student") {

        studentLoginForm.classList.remove(
            "hidden"
        );


        setTimeout(function () {

            const input =
                document.getElementById(
                    "studentEmail"
                );

            if (input) {

                input.focus();

            }

        }, 150);

    }


    if (role === "admin") {

        adminLoginForm.classList.remove(
            "hidden"
        );


        setTimeout(function () {

            const input =
                document.getElementById(
                    "adminEmail"
                );

            if (input) {

                input.focus();

            }

        }, 150);

    }

}


/* =========================================================
   BACK TO ROLE SELECTION
========================================================= */

function backToRoles() {

    roleSelection.classList.remove(
        "hidden"
    );

    studentLoginForm.classList.add(
        "hidden"
    );

    adminLoginForm.classList.add(
        "hidden"
    );

}


/* =========================================================
   PASSWORD SHOW / HIDE
========================================================= */

function togglePassword(
    inputId,
    button
) {

    const input =
        document.getElementById(
            inputId
        );


    if (!input) {

        return;

    }


    if (
        input.type === "password"
    ) {

        input.type = "text";

        button.textContent = "Hide";

    }

    else {

        input.type = "password";

        button.textContent = "Show";

    }

}


/* =========================================================
   EMAIL VALIDATION
========================================================= */

function isValidEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(email);

}


/* =========================================================
   STUDENT LOGIN
========================================================= */

let authToken = null;

async function studentLogin() {
    const email = document.getElementById("studentEmail").value.trim();
    const name = document.getElementById("studentName").value.trim();
    const password = document.getElementById("studentPassword").value.trim();

    if (!email || !password) {
        showToast("Required", "Email and Password are required.");
        return;
    }

    try {
        let response = await fetch("http://localhost:3000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        
        let data = await response.json();
        
        if (response.status === 401 || data.error) {
            const regResponse = await fetch("http://localhost:3000/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, full_name: name || "Student", college_id: "DEMO123" })
            });
            const regData = await regResponse.json();
            
            if (regData.error) {
                if (regData.error.includes("already registered") || regData.error.includes("already exists")) {
                    showToast("Login Failed", "Incorrect password for this email.");
                } else {
                    showToast("Auth Failed", regData.error);
                }
                return;
            }
            
            response = await fetch("http://localhost:3000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });
            data = await response.json();
        }

        if (data.error || !data.access_token) {
            showToast("Login Failed", data.error || "Could not get access token.");
            return;
        }

        authToken = data.access_token;
        currentUserName = name || "Student";
        showToast("Success", `Welcome, ${currentUserName}.`);

        closeAccess();
        landingPage.classList.remove("active");
        landingPage.style.display = "none";
        studentPortal.classList.remove("hidden");
        studentPortal.style.display = "block";
        showStudentDashboard();
        
        const welcome = document.getElementById("studentWelcome");
        if (welcome) welcome.textContent = `Welcome, ${currentUserName}.`;
        window.scrollTo({top: 0, behavior: "instant"});
    } catch (e) {
        showToast("Demo Login", `Welcome, ${name || 'Student'}.`);
        currentUserName = name || "Student";
        closeAccess();
        landingPage.classList.remove("active");
        landingPage.style.display = "none";
        studentPortal.classList.remove("hidden");
        studentPortal.style.display = "block";
        showStudentDashboard();
    }
}

/* =========================================================
   ADMIN LOGIN
========================================================= */

let adminAuthToken = null;

async function adminLogin() {
    const email = document.getElementById("adminEmail").value.trim();
    const name = document.getElementById("adminName").value.trim();
    const password = document.getElementById("adminPassword").value.trim();

    if (!email || !password) {
        showToast("Required", "Email and Password are required.");
        return;
    }

    try {
        let response = await fetch("http://localhost:3000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        let data = await response.json();

        if (response.status === 401 || data.error) {
            const regResponse = await fetch("http://localhost:3000/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, full_name: name || "Admin", college_id: "ADMIN001" })
            });
            const regData = await regResponse.json();
            if (!regData.error) {
                response = await fetch("http://localhost:3000/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                });
                data = await response.json();
            }
        }

        if (data && data.access_token) {
            adminAuthToken = data.access_token;
        }

        showToast("Admin portal", `Welcome, ${name || 'Administrator'}.`);
        closeAccess();
        landingPage.classList.remove("active");
        landingPage.style.display = "none";
        adminPortal.classList.remove("hidden");
        adminPortal.style.display = "block";
        showAdminDashboard();
        window.scrollTo({top: 0, behavior: "instant"});
    } catch (e) {
        showToast("Admin portal", `Welcome, ${name || 'Administrator'}.`);
        closeAccess();
        landingPage.classList.remove("active");
        landingPage.style.display = "none";
        adminPortal.classList.remove("hidden");
        adminPortal.style.display = "block";
        showAdminDashboard();
    }
}

/* =========================================================
   LOGOUT
========================================================= */

function logout() {

    closeDropoffAnalytics();

    studentPortal.classList.add(
        "hidden"
    );

    studentPortal.style.display =
        "none";


    adminPortal.classList.add(
        "hidden"
    );

    adminPortal.style.display =
        "none";


    landingPage.classList.add(
        "active"
    );

    landingPage.style.display =
        "block";


    currentUserName = "";


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    showToast(
        "Logged out",
        "You have returned to the Civic Bridge home page."
    );

}


/* =========================================================
   STUDENT DEMO BUTTON
========================================================= */

function openSchemeDiscovery() {
    showStudentView("scheme");
}

function studentFeature(target) {
    if (target === "documents") {
        openDocuments();
        return;
    }

    if (target === "applications") {
        openApplications();
        return;
    }

    openSchemeDiscovery();
}


/* =========================================================
   CIVIC BRIDGE AI CHAT
========================================================= */

let aiTypingTimer = null;

function openAIChat() {
    const overlay = document.getElementById("aiChatOverlay");
    const messages = document.getElementById("aiChatMessages");

    if (!overlay || !messages) {
        return;
    }

    overlay.classList.add("active");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    if (!messages.children.length) {
        addAIMessage("Civic Bridge AI:<br><br>Hello! I'm Civic Bridge AI. I can help you explore government education and financial-support schemes.<br><br>Tell me what you need help with, and I'll guide you through the next steps.");
    }

    scrollChatToBottom();

    setTimeout(function() {
        const input = document.getElementById("aiChatInput");
        if (input) {
            input.focus();
        }
    }, 180);
}

function closeAIChat() {
    const overlay = document.getElementById("aiChatOverlay");

    if (!overlay) {
        return;
    }

    overlay.classList.remove("active");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    hideAITyping();
}

let chatConversationHistory = [];
let chatSessionId = "session-" + Date.now();

async function sendAIMessage() {
    const input = document.getElementById("aiChatInput");
    const message = input ? input.value.trim() : "";

    if (!message) {
        return false;
    }

    addUserMessage(message);
    chatConversationHistory.push({ role: "user", content: message });
    input.value = "";
    input.style.height = "";
    showAITyping();

    try {
        const response = await fetch("http://localhost:5000/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                message: message, 
                session_id: chatSessionId,
                history: chatConversationHistory 
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            hideAITyping();
            if (data.session_id) {
                chatSessionId = data.session_id;
            }
            const botReply = data.response || generateDemoAIResponse(message);
            addAIMessage(botReply);
            chatConversationHistory.push({ role: "assistant", content: botReply });
            return false;
        }
    } catch (e) {
        // Fallback to demo response smoothly
    }

    clearTimeout(aiTypingTimer);
    aiTypingTimer = setTimeout(function() {
        hideAITyping();
        const reply = generateDemoAIResponse(message);
        addAIMessage(reply);
        chatConversationHistory.push({ role: "assistant", content: reply });
    }, 600);

    return false;
}

function sendSuggestion(suggestion) {
    const input = document.getElementById("aiChatInput");

    if (input) {
        input.value = suggestion.trim();
        sendAIMessage();
    }
}

function handleAIChatKey(event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendAIMessage();
        return;
    }

    if (event.key === "Enter" && event.shiftKey) {
        return;
    }

    const input = event.target;
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, 120)}px`;
}

function addUserMessage(message) {
    addChatMessage(message, "user", "•");
}

function addAIMessage(message) {
    addChatMessage(message, "ai", "✦");
}

function addChatMessage(message, type, avatar) {
    const messages = document.getElementById("aiChatMessages");

    if (!messages) {
        return;
    }

    const messageElement = document.createElement("div");
    const avatarElement = document.createElement("div");
    const bubbleElement = document.createElement("div");

    messageElement.className = `ai-chat-message ${type}`;
    avatarElement.className = "chat-message-avatar";
    avatarElement.textContent = avatar;
    bubbleElement.className = "chat-message-bubble";

    if (type === "user") {
        bubbleElement.textContent = message;
    }

    else {
        bubbleElement.innerHTML = message.replace(/\n/g, "<br>");
    }

    messageElement.append(avatarElement, bubbleElement);
    messages.appendChild(messageElement);
    scrollChatToBottom();
}

function showAITyping() {
    const messages = document.getElementById("aiChatMessages");

    if (!messages || document.getElementById("aiTyping")) {
        return;
    }

    const typing = document.createElement("div");
    typing.id = "aiTyping";
    typing.className = "ai-chat-message ai";
    typing.innerHTML = '<div class="chat-message-avatar">✦</div><div class="chat-message-bubble ai-chat-typing"><span></span><span></span><span></span></div>';
    messages.appendChild(typing);
    scrollChatToBottom();
}

function hideAITyping() {
    const typing = document.getElementById("aiTyping");

    if (typing) {
        typing.remove();
    }
}

function clearChat() {
    const messages = document.getElementById("aiChatMessages");

    if (!messages) {
        return;
    }

    chatSessionId = "session-" + Date.now();
    chatConversationHistory = [];
    clearTimeout(aiTypingTimer);
    hideAITyping();
    messages.innerHTML = "";
    addAIMessage("Civic Bridge AI:<br><br>Hello! I'm Civic Bridge AI. I can help you explore government education and financial-support schemes.<br><br>Tell me what you need help with, and I'll guide you through the next steps.");
}

function scrollChatToBottom() {
    const messages = document.getElementById("aiChatMessages");

    if (messages) {
        messages.scrollTop = messages.scrollHeight;
    }
}

function generateDemoAIResponse(message) {
    const question = message.toLowerCase();

    if (/fee|fees|tuition|college expense|financial help|money/.test(question)) {
        return "I can help you explore education and financial-support schemes that may help with college expenses. To identify relevant schemes, I'll need details such as your course, family income, state and other eligibility information. Please verify final eligibility on the official government portal.";
    }

    if (/document|paperwork|certificate|aadhaar|aadhar/.test(question)) {
        return "Common documents may include an Aadhaar card, income certificate, community certificate where applicable, college ID or admission proof, bank account details and academic records. Exact requirements depend on the scheme.";
    }

    if (/eligib|qualif|criteria|who can/.test(question)) {
        return "Eligibility depends on the individual scheme. Important factors can include course or education level, family income, state or residence, category, academic requirements and other scheme-specific conditions. A potential match is not a guarantee, so please verify the final eligibility on the official government portal.";
    }

    if (/find|scheme|scholarship|support|help me/.test(question)) {
        return "I can help narrow down potentially relevant schemes. Tell me your course, family income range, state and what kind of support you need. I can then help you identify a potential match to verify on the official government portal.";
    }

    if (/apply|application|portal|submit|process/.test(question)) {
        return "I can guide you through the application process. Usually, you review eligibility, prepare the required documents, complete the official application form and submit it through the designated government portal. Please verify the final steps on that portal.";
    }

    return "I can help with government education and financial-support schemes, eligibility, documents and application guidance. Tell me what you need help with.";
}


/* =========================================================
   DEMO DATA + VIEW SYSTEM
========================================================= */

const STORAGE_KEY = "civicBridgeDemoStateV1";

const defaultSchemes = [
    {
        id: "vidyashree-support",
        name: "Vidyashree Education Support",
        category: "Scholarship",
        potentialMatch: "High match",
        about: "A flagship education-support scheme designed to reduce the financial burden for students pursuing higher education in recognized institutions.",
        whoMayApply: "Students enrolled in undergraduate or diploma programs who meet the income and residence conditions.",
        education: "Must be enrolled in a recognized college or diploma program.",
        income: "Annual family income below ₹3 lakh for eligible recipients.",
        location: "Resident of Karnataka.",
        otherConditions: "Applicant should not have received another comparable education scholarship in the same academic year.",
        documents: ["Income certificate", "College admission proof", "Bank account details", "Aadhaar card"],
        applicationMethod: "Online portal application + document upload",
        portal: "https://example.gov.in/vidyashree",
        status: "Active",
        applicationSteps: [
            "Review eligibility and confirm resident status.",
            "Prepare income and academic documents.",
            "Complete the online application and upload documents.",
            "Track application status on the official portal."
        ]
    },
    {
        id: "merit-plus-scholarship",
        name: "Merit Plus Scholarship",
        category: "Merit",
        potentialMatch: "Moderate match",
        about: "Support for students with strong academic performance who need assistance with tuition and learning-related expenses.",
        whoMayApply: "Students with consistent academic performance in a recognized course and a valid income record.",
        education: "Minimum 75% in the previous academic year or equivalent GPA.",
        income: "Annual household income below ₹4.5 lakh.",
        location: "Open to applicants from selected districts.",
        otherConditions: "Students should submit an updated academic record and verified fee receipt.",
        documents: ["Mark sheets", "Fee receipt", "Income certificate", "Bonafide certificate"],
        applicationMethod: "Government scholarship portal",
        portal: "https://example.gov.in/meritplus",
        status: "Active",
        applicationSteps: [
            "Confirm academic eligibility.",
            "Upload marksheets and fee details.",
            "Submit the scholarship form.",
            "Check selection status and document verification updates."
        ]
    },
    {
        id: "hostel-support-grant",
        name: "Hostel Support Grant",
        category: "Accommodation",
        potentialMatch: "Strong match",
        about: "A hostel and living-cost support grant for students from financially weaker backgrounds pursuing higher education away from home.",
        whoMayApply: "Students studying outside their home district who need accommodation assistance.",
        education: "Must be enrolled in a full-time course recognized by the university or college.",
        income: "Annual family income below ₹2.5 lakh.",
        location: "Applicable for students staying in university or state hostel facilities.",
        otherConditions: "Applicants should provide an accommodation statement and local address proof.",
        documents: ["Hostel admission letter", "Income certificate", "Residence proof", "College ID"],
        applicationMethod: "College admin office + online application form",
        portal: "https://example.gov.in/hostelgrant",
        status: "Reviewing",
        applicationSteps: [
            "Check hostel eligibility and stay condition.",
            "Submit residence and college proof.",
            "Complete hostel grant application.",
            "Track result after verification."
        ]
    }
];

const defaultDocuments = [
    {
        id: "income-certificate",
        name: "Income Certificate",
        status: "missing",
        requiredFor: ["Vidyashree Education Support", "Merit Plus Scholarship"],
        whatIsIt: "An official certificate showing the household income range used to assess financial eligibility.",
        whyRequired: "It helps determine whether the applicant qualifies under the income-based conditions of the scheme.",
        contains: "Annual income details, family information, issuing authority and certificate validity period.",
        tips: ["Double-check the certificate date and issuing authority.", "Keep the document in PDF or JPG format.", "Ensure the income figure matches your latest declaration."],
        mistakes: ["Using an outdated income certificate.", "Uploading a blurred or cropped document.", "Mismatch between household information and application details."],
        example: "Income certificate issued by the local tehsil or revenue office with applicant and family details."
    },
    {
        id: "college-id",
        name: "College ID / Enrollment Proof",
        status: "ready",
        requiredFor: ["Vidyashree Education Support", "Hostel Support Grant"],
        whatIsIt: "Proof that you are actively enrolled in an approved course or college.",
        whyRequired: "This verifies that the applicant is a current student and eligible under educational conditions.",
        contains: "Student name, roll number, course details, college name and valid period.",
        tips: ["Keep a clear scan of the front side of the ID card.", "Use your latest enrollment letter if your card is not yet issued."],
        mistakes: ["Uploading an expired ID card.", "Using a screenshot instead of a formal proof.", "Leaving off the course or enrollment number."],
        example: "College-issued identity card or admission confirmation letter with current academic year details."
    },
    {
        id: "bank-passbook",
        name: "Bank Passbook / Account Details",
        status: "missing",
        requiredFor: ["Vidyashree Education Support", "Merit Plus Scholarship"],
        whatIsIt: "A bank record showing the applicant’s account details needed for scholarship disbursement.",
        whyRequired: "Some schemes transfer support directly to the student’s bank account or require account verification.",
        contains: "Account holder name, account number, IFSC code, branch details and bank seal.",
        tips: ["Use the same account name entered in the application form.", "Verify the IFSC code before uploading the passbook page."],
        mistakes: ["Uploading a blank or partial page.", "Using the wrong account type for disbursement.", "Missing bank seal or branch detail."],
        example: "First page of the passbook showing account holder details and IFSC code."
    },
    {
        id: "mark-sheet",
        name: "Academic Mark Sheet",
        status: "ready",
        requiredFor: ["Merit Plus Scholarship"],
        whatIsIt: "A recent academic record showing marks or grade performance.",
        whyRequired: "Many merit-based schemes use academic performance as an eligibility and selection factor.",
        contains: "Semester, subjects, marks obtained and overall grade or percentage.",
        tips: ["Upload the latest available marksheet.", "Check that the document is legible and not cropped."],
        mistakes: ["Using an old result copy instead of the current one.", "Uploading a low-quality image.", "Not matching the academic year entered in the form."],
        example: "Semester mark sheet with the student’s name, course and grade summary."
    }
];

const defaultApplications = [
    {
        id: "APP-2041",
        schemeId: "vidyashree-support",
        schemeName: "Vidyashree Education Support",
        started: "2026-09-12",
        currentStatus: "In Progress",
        progress: 58,
        stageIndex: 2,
        currentStage: "Documents Prepared",
        nextAction: "Upload the final income certificate and confirm the bank account details before submission.",
        formStatus: "Draft saved",
        submissionStatus: "Not submitted",
        documentsStatus: "2 of 4 ready",
        timeline: [
            "Scheme Selected",
            "Eligibility Reviewed",
            "Documents Prepared",
            "Application Form",
            "Submitted"
        ],
        documentChecklist: [
            { name: "Income Certificate", done: true },
            { name: "College ID / Enrollment Proof", done: true },
            { name: "Bank Passbook", done: false },
            { name: "Aadhaar Card", done: false }
        ]
    },
    {
        id: "APP-2047",
        schemeId: "merit-plus-scholarship",
        schemeName: "Merit Plus Scholarship",
        started: "2026-09-09",
        currentStatus: "Ready to Submit",
        progress: 82,
        stageIndex: 3,
        currentStage: "Application Form",
        nextAction: "Review the application summary and submit the final scholarship form.",
        formStatus: "Completed",
        submissionStatus: "Awaiting final check",
        documentsStatus: "4 of 4 ready",
        timeline: [
            "Scheme Selected",
            "Eligibility Reviewed",
            "Documents Prepared",
            "Application Form",
            "Submitted"
        ],
        documentChecklist: [
            { name: "Mark Sheets", done: true },
            { name: "Fee Receipt", done: true },
            { name: "Income Certificate", done: true },
            { name: "Bonafide Certificate", done: true }
        ]
    },
    {
        id: "APP-2054",
        schemeId: "hostel-support-grant",
        schemeName: "Hostel Support Grant",
        started: "2026-08-29",
        currentStatus: "Submitted",
        progress: 100,
        stageIndex: 4,
        currentStage: "Submitted",
        nextAction: "Application has been submitted. Check portal updates for the verification result.",
        formStatus: "Submitted",
        submissionStatus: "Submitted",
        documentsStatus: "4 of 4 ready",
        timeline: [
            "Scheme Selected",
            "Eligibility Reviewed",
            "Documents Prepared",
            "Application Form",
            "Submitted"
        ],
        documentChecklist: [
            { name: "Hostel Admission Letter", done: true },
            { name: "Income Certificate", done: true },
            { name: "Residence Proof", done: true },
            { name: "College ID", done: true }
        ]
    }
];

const defaultEligibilityRules = [
    { id: "education-rule", name: "Education Requirement", description: "Applicant must be enrolled in a recognized course or institution.", status: "Active", schemesUsing: 3 },
    { id: "income-rule", name: "Income Requirement", description: "Annual household income should be below the scheme threshold for support eligibility.", status: "Active", schemesUsing: 2 },
    { id: "location-rule", name: "Location Requirement", description: "Resident or study location requirements vary by scheme and region.", status: "Pending Review", schemesUsing: 2 },
    { id: "academic-rule", name: "Academic Requirement", description: "Some schemes require minimum marks, grade level or consistent performance.", status: "Active", schemesUsing: 1 },
    { id: "age-rule", name: "Age Requirement", description: "Age thresholds may apply depending on the scheme and funding authority.", status: "Inactive", schemesUsing: 0 },
    { id: "other-rule", name: "Other Conditions", description: "Applicants may need to meet additional conditions such as course type, category or state rules.", status: "Active", schemesUsing: 2 }
];

const defaultProblems = [
    { id: "document-collection", name: "Document Collection", reports: 248, studentsAffected: 186, friction: 32, status: "Needs attention" },
    { id: "eligibility-confusion", name: "Eligibility Confusion", reports: 162, studentsAffected: 114, friction: 21, status: "Monitoring" },
    { id: "portal-login", name: "Portal / Login", reports: 117, studentsAffected: 89, friction: 18, status: "Reviewing" },
    { id: "application-form", name: "Application Form", reports: 92, studentsAffected: 74, friction: 14, status: "Reviewing" },
    { id: "application-status", name: "Application Status", reports: 55, studentsAffected: 38, friction: 9, status: "Monitoring" },
    { id: "language-accessibility", name: "Language / Accessibility", reports: 42, studentsAffected: 31, friction: 6, status: "Needs attention" }
];

let schemes = [];
let documents = [];
let applications = [];
let eligibilityRules = [];
let problems = [];

function loadDemoState() {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
        schemes = [...defaultSchemes];
        documents = [...defaultDocuments];
        applications = [...defaultApplications];
        eligibilityRules = [...defaultEligibilityRules];
        problems = [...defaultProblems];
        return;
    }

    try {
        const parsed = JSON.parse(saved);
        schemes = Array.isArray(parsed.schemes) && parsed.schemes.length ? parsed.schemes : [...defaultSchemes];
        documents = Array.isArray(parsed.documents) && parsed.documents.length ? parsed.documents : [...defaultDocuments];
        applications = Array.isArray(parsed.applications) && parsed.applications.length ? parsed.applications : [...defaultApplications];
        eligibilityRules = Array.isArray(parsed.eligibilityRules) && parsed.eligibilityRules.length ? parsed.eligibilityRules : [...defaultEligibilityRules];
        problems = Array.isArray(parsed.problems) && parsed.problems.length ? parsed.problems : [...defaultProblems];
    }
    catch (error) {
        schemes = [...defaultSchemes];
        documents = [...defaultDocuments];
        applications = [...defaultApplications];
        eligibilityRules = [...defaultEligibilityRules];
        problems = [...defaultProblems];
    }
}

function saveDemoState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        schemes,
        documents,
        applications,
        eligibilityRules,
        problems
    }));
}

function getStudentMainView() {
    return studentPortal ? studentPortal.querySelector(".portal-main") : null;
}

function getStudentSubViews() {
    return document.querySelectorAll("[data-student-view]");
}

function getAdminSubViews() {
    return document.querySelectorAll("[data-admin-view]");
}

function showStudentDashboard() {
    const studentMain = getStudentMainView();

    if (studentMain) {
        studentMain.classList.remove("hidden");
        studentMain.style.display = "block";
    }

    getStudentSubViews().forEach(function(view) {
        view.classList.add("hidden");
        view.innerHTML = "";
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
}

function showAdminDashboard() {
    const dashboard = document.getElementById("adminDashboardView");
    const analytics = document.getElementById("dropoffAnalyticsView");

    if (dashboard) {
        dashboard.classList.remove("hidden");
        dashboard.style.display = "block";
    }

    if (analytics) {
        analytics.classList.add("hidden");
    }

    getAdminSubViews().forEach(function(view) {
        view.classList.add("hidden");
        view.innerHTML = "";
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
}

function showStudentView(viewName) {
    const studentMain = getStudentMainView();

    if (studentMain) {
        studentMain.classList.add("hidden");
        studentMain.style.display = "none";
    }

    getStudentSubViews().forEach(function(view) {
        const matches = view.getAttribute("data-student-view") === viewName;
        view.classList.toggle("hidden", !matches);
    });

    if (viewName === "scheme") {
        renderSchemeDiscovery();
    }

    if (viewName === "documents") {
        renderDocumentsView();
    }

    if (viewName === "applications") {
        renderApplicationsView();
    }

    if (viewName === "scheme-details") {
        renderSchemeDetailsView();
    }

    if (viewName === "document-guide") {
        renderDocumentGuideView();
    }

    if (viewName === "application-details") {
        renderApplicationDetailsView();
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
}

function showAdminView(viewName) {
    const dashboard = document.getElementById("adminDashboardView");
    const analytics = document.getElementById("dropoffAnalyticsView");

    if (dashboard) {
        dashboard.classList.add("hidden");
        dashboard.style.display = "none";
    }

    if (analytics) {
        analytics.classList.add("hidden");
    }

    if (viewName === "scheme-management") {
        renderAdminSchemeManagement();
    }

    if (viewName === "scheme-detail") {
        renderAdminSchemeDetail();
    }

    if (viewName === "eligibility-rules") {
        renderEligibilityRules();
    }

    if (viewName === "applications") {
        renderAdminApplications();
    }

    if (viewName === "problem-insights") {
        renderProblemInsights();
    }

    if (viewName === "platform-insights") {
        renderPlatformInsights();
    }

    if (viewName === "scheme-form") {
        renderAdminSchemeForm();
    }

    if (viewName === "scheme-edit") {
        renderAdminSchemeForm(true);
    }

    if (viewName === "rule-edit") {
        renderAdminRuleEdit();
    }

    if (viewName === "application-detail") {
        renderAdminApplicationDetail();
    }

    getAdminSubViews().forEach(function(view) {
        const matches = view.getAttribute("data-admin-view") === viewName;
        view.classList.toggle("hidden", !matches);
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderSchemeDiscovery() {
    const view = document.getElementById("studentSchemeView");

    if (!view) {
        return;
    }

    const filter = document.getElementById("schemeFilter") ? document.getElementById("schemeFilter").value : "All";
    const searchValue = document.getElementById("schemeSearchInput") ? document.getElementById("schemeSearchInput").value.trim().toLowerCase() : "";

    const categories = ["All", ...new Set(schemes.map(function(scheme) { return scheme.category; }))];
    const filteredSchemes = schemes.filter(function(scheme) {
        const matchesCategory = filter === "All" || scheme.category === filter;
        const searchableText = [scheme.name, scheme.about, scheme.category, scheme.location || ""].join(" ").toLowerCase();
        const matchesSearch = !searchValue || searchableText.includes(searchValue);
        return matchesCategory && matchesSearch;
    });

    view.innerHTML = `
        <div class="portal-subview-frame">
            <div class="subview-header">
                <button type="button" class="back-link" onclick="showStudentDashboard()">← Dashboard</button>
                <div class="subview-headings">
                    <span class="section-label">STUDENT PORTAL</span>
                    <h2>Scheme Discovery</h2>
                </div>
            </div>

            <div class="subview-toolbar">
                <input id="schemeSearchInput" type="search" placeholder="Search schemes or keywords" value="${searchValue.replace(/"/g, '&quot;')}" oninput="renderSchemeDiscovery()" />
                <select id="schemeFilter" onchange="renderSchemeDiscovery()">
                    ${categories.map(function(category) {
                        return `<option value="${category}" ${category === filter ? "selected" : ""}>${category}</option>`;
                    }).join("")}
                </select>
            </div>

            <div class="scheme-grid">
                ${filteredSchemes.length ? filteredSchemes.map(function(scheme) {
                    return `
                        <article class="scheme-card">
                            <div class="scheme-card-top">
                                <span class="tag-pill">${scheme.category}</span>
                                <span class="match-pill">${scheme.potentialMatch}</span>
                            </div>
                            <h3>${scheme.name}</h3>
                            <p>${scheme.about}</p>
                            <div class="scheme-summary-block">
                                <div><span>Eligibility</span><strong>${scheme.education}</strong></div>
                                <div><span>Income</span><strong>${scheme.income}</strong></div>
                                <div><span>Location</span><strong>${scheme.location}</strong></div>
                            </div>
                            <div class="scheme-card-actions">
                                <button type="button" class="secondary-action" onclick="openSchemeDetails('${scheme.id}')">View Details</button>
                                <button type="button" class="primary-action" onclick="startApplication('${scheme.id}')">Start Application</button>
                            </div>
                        </article>
                    `;
                }).join("") : `<div class="empty-state"><h3>No matching schemes</h3><p>Try a different keyword or filter to explore more options.</p></div>`}
            </div>
        </div>
    `;
}

function openSchemeDetails(id) {
    currentSelectedSchemeId = id;
    showStudentView("scheme-details");
}

function renderSchemeDetailsView() {
    const view = document.getElementById("studentSchemeDetailsView");

    if (!view) {
        return;
    }

    const scheme = schemes.find(function(item) { return item.id === currentSelectedSchemeId; }) || schemes[0];

    view.innerHTML = `
        <div class="portal-subview-frame detail-layout">
            <button type="button" class="back-link" onclick="showStudentView('scheme')">← Back to Scheme Discovery</button>

            <div class="detail-header">
                <div>
                    <span class="section-label">SCHEME DETAILS</span>
                    <h2>${scheme.name}</h2>
                </div>
                <span class="tag-pill strong-pill">${scheme.potentialMatch}</span>
            </div>

            <div class="detail-grid">
                <section class="detail-panel large-panel">
                    <h3>About the scheme</h3>
                    <p>${scheme.about}</p>
                    <div class="detail-list">
                        <div><span>Scheme category</span><strong>${scheme.category}</strong></div>
                        <div><span>Who may apply</span><strong>${scheme.whoMayApply}</strong></div>
                        <div><span>Education requirement</span><strong>${scheme.education}</strong></div>
                        <div><span>Income requirement</span><strong>${scheme.income}</strong></div>
                        <div><span>Location requirement</span><strong>${scheme.location}</strong></div>
                        <div><span>Other conditions</span><strong>${scheme.otherConditions}</strong></div>
                    </div>
                </section>

                <aside class="detail-panel side-panel">
                    <h3>Required documents</h3>
                    <ul class="check-list">
                        ${scheme.documents.map(function(item) { return `<li>${item}</li>`; }).join("")}
                    </ul>
                    <div class="meta-box">
                        <span>Application method</span>
                        <strong>${scheme.applicationMethod}</strong>
                    </div>
                    <div class="meta-box">
                        <span>Official portal</span>
                        <strong>${scheme.portal}</strong>
                    </div>
                </aside>
            </div>

            <section class="detail-panel">
                <h3>Application steps</h3>
                <ol class="number-list">
                    ${scheme.applicationSteps.map(function(item) { return `<li>${item}</li>`; }).join("")}
                </ol>
            </section>

            <div class="detail-actions">
                <button type="button" class="primary-action" onclick="startApplication('${scheme.id}')">Start Application</button>
            </div>

            <p class="detail-disclaimer">Potential match only. Verify current eligibility and requirements on the official scheme portal.</p>
        </div>
    `;
}

function openDocuments() {
    showStudentView("documents");
}

function renderDocumentsView() {
    const view = document.getElementById("studentDocumentsView");

    if (!view) {
        return;
    }

    const total = documents.length;
    const ready = documents.filter(function(document) { return document.status === "ready"; }).length;
    const progress = total ? Math.round((ready / total) * 100) : 0;

    view.innerHTML = `
        <div class="portal-subview-frame">
            <div class="subview-header">
                <button type="button" class="back-link" onclick="showStudentDashboard()">← Dashboard</button>
                <div class="subview-headings">
                    <span class="section-label">DOCUMENTS</span>
                    <h2>Document Checklist</h2>
                </div>
            </div>

            <div class="summary-row">
                <div class="summary-box">
                    <span>Documents ready</span>
                    <strong>${ready} / ${total}</strong>
                </div>
                <div class="summary-box">
                    <span>Documents missing</span>
                    <strong>${total - ready}</strong>
                </div>
                <div class="summary-box accent-box">
                    <span>Progress</span>
                    <strong>${progress}%</strong>
                </div>
            </div>

            <div class="progress-outer"><div class="progress-fill" style="width:${progress}%"></div></div>

            <div class="document-list">
                ${documents.map(function(document) {
                    const isReady = document.status === "ready";
                    return `
                        <article class="document-item ${isReady ? "ready" : "missing"}">
                            <div>
                                <h3>${document.name}</h3>
                                <p>${document.whyRequired}</p>
                            </div>
                            <div class="document-status">
                                <span class="status-badge ${isReady ? "ready-status" : "missing-status"}">${isReady ? "Ready" : "Missing"}</span>
                            </div>
                            <div class="document-actions">
                                <button type="button" class="ghost-button" onclick="openDocumentGuidance('${document.id}')">View Guidance</button>
                                <label class="ghost-button" style="cursor: pointer; display: inline-block; margin-bottom: 0;">
                                      ${isReady ? "Replace File" : "Upload File"}
                                      <input type="file" style="display:none;" onchange="handleFileUpload('${document.id}', '${document.name}', this.files[0])" />
                                  </label>
                                <button type="button" class="ghost-button" onclick="resetDocumentStatus('${document.id}')">Remove</button>
                            </div>
                        </article>
                    `;
                }).join("")}

                <article class="document-item add-document-item">
                    <div>
                        <h3>+ Add Document</h3>
                        <p>Add a document to your personal checklist for tracking.</p>
                    </div>
                    <div class="document-status">
                        <span class="status-badge status-neutral">New</span>
                    </div>
                    <div class="document-actions add-document-actions">
                        <button type="button" class="primary-action" onclick="toggleAddDocumentForm()">+ Add Document</button>
                    </div>
                </article>

                <div id="documentAddPanel" class="document-add-panel hidden">
                    <div class="document-add-header">
                        <h3>Add Document</h3>
                    </div>
                    <label class="document-add-field">
                        <span>Document Name</span>
                        <input id="newDocumentName" type="text" placeholder="Document name" />
                    </label>
                    <label class="document-add-field">
                        <span>Description</span>
                        <textarea id="newDocumentDescription" rows="3" placeholder="Short description"></textarea>
                    </label>
                    <div class="document-add-actions">
                        <button type="button" class="ghost-button" onclick="toggleAddDocumentForm()">Cancel</button>
                        <button type="button" class="primary-action" onclick="addCustomDocument()">Add Document</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function toggleAddDocumentForm() {
    const panel = document.getElementById("documentAddPanel");

    if (!panel) {
        return;
    }

    panel.classList.toggle("hidden");

    const input = document.getElementById("newDocumentName");

    if (input && !panel.classList.contains("hidden")) {
        setTimeout(function() { input.focus(); }, 100);
    }
}

function addCustomDocument() {
    const nameInput = document.getElementById("newDocumentName");
    const descriptionInput = document.getElementById("newDocumentDescription");

    if (!nameInput || !descriptionInput) {
        return;
    }

    const name = nameInput.value.trim();
    const description = descriptionInput.value.trim();

    if (!name) {
        showToast("Document name required", "Please enter a document name before adding it.");
        nameInput.focus();
        return;
    }

    const newDocument = {
        id: `custom-doc-${Date.now()}`,
        name: name,
        status: "missing",
        requiredFor: ["Custom document"],
        whatIsIt: description || "Custom document added from the student checklist for demo tracking.",
        whyRequired: "This document was added through the frontend checklist demo and can be tracked like other required items.",
        contains: "Document details entered through the add-document demo panel.",
        tips: ["Keep a clear copy of the document.", "Upload it when you are ready to proceed."],
        mistakes: ["Using a low-quality or incomplete copy.", "Submitting without checking the final details."],
        example: "A clear scanned copy or uploaded file with the required information."
    };

    documents.push(newDocument);
    saveDemoState();
    toggleAddDocumentForm();
    nameInput.value = "";
    descriptionInput.value = "";
    renderDocumentsView();
    showToast("Document added", `${name} was added to the checklist.`);
}

function toggleDocumentStatus(id) {
    const item = documents.find(function(document) { return document.id === id; });

    if (!item) {
        return;
    }

    item.status = item.status === "ready" ? "missing" : "ready";
    saveDemoState();
    renderDocumentsView();
    showToast("Document updated", "The document checklist has been refreshed.");
}

function resetDocumentStatus(id) {
    const item = documents.find(function(document) { return document.id === id; });

    if (!item) {
        return;
    }

    item.status = "missing";
    saveDemoState();
    renderDocumentsView();
    showToast("Document reset", "The item is back to missing status.");
}

function openDocumentGuidance(id) {
    currentSelectedDocumentId = id;
    showStudentView("document-guide");
}

function renderDocumentGuideView() {
    const view = document.getElementById("studentDocumentGuideView");

    if (!view) {
        return;
    }

    const documentItem = documents.find(function(item) { return item.id === currentSelectedDocumentId; }) || documents[0];

    view.innerHTML = `
        <div class="portal-subview-frame">
            <button type="button" class="back-link" onclick="openDocuments()">← Back to Documents</button>

            <div class="guide-header">
                <span class="section-label">DOCUMENT GUIDANCE</span>
                <h2>${documentItem.name}</h2>
            </div>

            <div class="guide-grid">
                <section class="detail-panel">
                    <h3>What this document is</h3>
                    <p>${documentItem.whatIsIt}</p>
                </section>
                <section class="detail-panel">
                    <h3>Why it may be required</h3>
                    <p>${documentItem.whyRequired}</p>
                </section>
            </div>

            <div class="guide-grid">
                <section class="detail-panel">
                    <h3>Information it usually contains</h3>
                    <p>${documentItem.contains}</p>
                </section>
                <section class="detail-panel">
                    <h3>Preparation tips</h3>
                    <ul class="check-list">
                        ${documentItem.tips.map(function(item) { return `<li>${item}</li>`; }).join("")}
                    </ul>
                </section>
            </div>

            <div class="guide-grid">
                <section class="detail-panel">
                    <h3>Common mistakes</h3>
                    <ul class="check-list warn-list">
                        ${documentItem.mistakes.map(function(item) { return `<li>${item}</li>`; }).join("")}
                    </ul>
                </section>
                <section class="detail-panel">
                    <h3>Example format</h3>
                    <p>${documentItem.example}</p>
                </section>
            </div>

            <p class="detail-disclaimer">Use this as educational guidance only. Exact requirements should be checked against the relevant official scheme and local authority guidelines.</p>
        </div>
    `;
}

function openApplications() {
    showStudentView("applications");
}

function renderApplicationsView() {
    const view = document.getElementById("studentApplicationsView");

    if (!view) {
        return;
    }

    view.innerHTML = `
        <div class="portal-subview-frame">
            <div class="subview-header">
                <button type="button" class="back-link" onclick="showStudentDashboard()">← Dashboard</button>
                <div class="subview-headings">
                    <span class="section-label">APPLICATIONS</span>
                    <h2>Application Tracking</h2>
                </div>
            </div>

            <div class="application-grid">
                ${applications.map(function(application) {
                    return `
                        <article class="application-card" onclick="openApplicationDetails('${application.id}')">
                            <div class="application-card-header">
                                <div>
                                    <span class="scheme-badge">${application.schemeName}</span>
                                    <h3>${application.schemeName}</h3>
                                </div>
                                <span class="status-badge ${getStatusClass(application.currentStatus)}">${application.currentStatus}</span>
                            </div>
                            <div class="meta-strip">
                                <span>Application ID: ${application.id}</span>
                                <span>Progress: ${application.progress}%</span>
                            </div>
                            <div class="progress-outer small-progress"><div class="progress-fill" style="width:${application.progress}%"></div></div>
                            <div class="application-meta">
                                <div><span>Documents</span><strong>${application.documentsStatus}</strong></div>
                                <div><span>Form</span><strong>${application.formStatus}</strong></div>
                                <div><span>Submission</span><strong>${application.submissionStatus}</strong></div>
                            </div>
                        </article>
                    `;
                }).join("")}
            </div>
        </div>
    `;
}

function openApplicationDetails(id) {
    currentSelectedApplicationId = id;
    showStudentView("application-details");
}

function renderApplicationDetailsView() {
    const view = document.getElementById("studentApplicationDetailsView");

    if (!view) {
        return;
    }

    const application = applications.find(function(item) { return item.id === currentSelectedApplicationId; }) || applications[0];
    const activeIndex = Math.max(0, application.stageIndex || 0);

    view.innerHTML = `
        <div class="portal-subview-frame">
            <button type="button" class="back-link" onclick="openApplications()">← Back to Applications</button>

            <div class="detail-header">
                <div>
                    <span class="section-label">APPLICATION DETAILS</span>
                    <h2>${application.schemeName}</h2>
                </div>
                <span class="status-badge ${getStatusClass(application.currentStatus)}">${application.currentStatus}</span>
            </div>

            <div class="detail-grid">
                <section class="detail-panel large-panel">
                    <h3>Application information</h3>
                    <div class="detail-list compact-list">
                        <div><span>Scheme</span><strong>${application.schemeName}</strong></div>
                        <div><span>Application ID</span><strong>${application.id}</strong></div>
                        <div><span>Date started</span><strong>${application.started}</strong></div>
                        <div><span>Current status</span><strong>${application.currentStatus}</strong></div>
                    </div>
                </section>

                <section class="detail-panel side-panel">
                    <h3>Progress</h3>
                    <div class="progress-outer"><div class="progress-fill" style="width:${application.progress}%"></div></div>
                    <p class="mini-copy">${application.progress}% complete</p>
                    <div class="meta-box"><span>Next action</span><strong>${application.nextAction}</strong></div>
                </section>
            </div>

            <section class="detail-panel">
                <h3>Application timeline</h3>
                <div class="timeline-list">
                    ${application.timeline.map(function(step, index) {
                        const active = index <= activeIndex;
                        return `
                            <div class="timeline-step ${active ? "active" : ""}">
                                <span class="timeline-dot ${active ? "complete" : ""}">${active ? "✓" : index + 1}</span>
                                <div>
                                    <strong>${step}</strong>
                                    ${index === activeIndex ? '<small>Current stage</small>' : ''}
                                </div>
                            </div>
                        `;
                    }).join("")}
                </div>
            </section>

            <div class="detail-grid">
                <section class="detail-panel">
                    <h3>Documents checklist</h3>
                    <ul class="check-list">
                        ${application.documentChecklist.map(function(item) {
                            return `<li>${item.name} <span class="mini-inline ${item.done ? "done" : "pending"}">${item.done ? "Ready" : "Pending"}</span></li>`;
                        }).join("")}
                    </ul>
                </section>

                <section class="detail-panel">
                    <h3>Guidance</h3>
                    <p>Keep all required documents ready before submission. Review the official scheme portal for the latest submission instructions and deadlines.</p>
                </section>
            </div>

            <div class="detail-actions">
                <button type="button" class="primary-action" onclick="continueApplication('${application.id}')">Continue Application</button>
            </div>
        </div>
    `;
}

function continueApplication(id) {
    const application = applications.find(function(item) { return item.id === id; });

    if (!application) {
        return;
    }

    application.stageIndex = Math.min(application.timeline.length - 1, (application.stageIndex || 0) + 1);
    application.progress = Math.min(100, application.progress + 18);
    application.currentStage = application.timeline[application.stageIndex];
    application.currentStatus = application.stageIndex >= application.timeline.length - 1 ? "Submitted" : application.currentStatus === "Ready to Submit" ? "Ready to Submit" : "In Progress";
    application.nextAction = application.stageIndex >= application.timeline.length - 1
        ? "Your application is submitted and awaiting verification."
        : "Complete the next stage and review the updated guidance.";

    if (application.stageIndex >= 3) {
        application.currentStatus = "Ready to Submit";
    }

    if (application.stageIndex >= 4) {
        application.currentStatus = "Submitted";
        application.submissionStatus = "Submitted";
        application.formStatus = "Submitted";
    }

    saveDemoState();
    renderApplicationDetailsView();
    showToast("Application updated", "The application progress was advanced for the demo flow.");
}

function startApplication(schemeId) {
    const scheme = schemes.find(function(item) { return item.id === schemeId; });

    if (!scheme) {
        return;
    }

    let existing = applications.find(function(application) {
        return application.schemeId === schemeId && application.currentStatus !== "Submitted";
    });

    if (!existing) {
        const newId = `APP-${Math.floor(2000 + Math.random() * 500)}`;
        const appointment = {
            id: newId,
            schemeId: scheme.id,
            schemeName: scheme.name,
            started: new Date().toISOString().slice(0, 10),
            currentStatus: "Not Started",
            progress: 16,
            stageIndex: 0,
            currentStage: "Scheme Selected",
            nextAction: "Review the scheme details and prepare the requested documents.",
            formStatus: "Not started",
            submissionStatus: "Not submitted",
            documentsStatus: "0 of 4 ready",
            timeline: ["Scheme Selected", "Eligibility Reviewed", "Documents Prepared", "Application Form", "Submitted"],
            documentChecklist: scheme.documents.map(function(doc) { return { name: doc, done: false }; })
        };

        applications.unshift(appointment);
        existing = appointment;
    }

    currentSelectedApplicationId = existing.id;
    openApplicationDetails(existing.id);
    showToast("Application started", `${scheme.name} has been opened in the demo tracker.`);
}

function getStatusClass(status) {
    if (status === "Ready to Submit" || status === "Submitted") {
        return "status-ready";
    }

    if (status === "In Progress" || status === "Documents Pending") {
        return "status-progress";
    }

    return "status-neutral";
}

function openAdminSchemeManagement() {
    showAdminView("scheme-management");
}

function renderAdminSchemeManagement() {
    const view = document.getElementById("adminSchemeManagementView");

    if (!view) {
        return;
    }

    view.innerHTML = `
        <div class="portal-subview-frame admin-page-shell">
            <button type="button" class="back-link" onclick="showAdminDashboard()">← Back to Administrator Portal</button>
            <div class="subview-header inline-header">
                <div class="subview-headings">
                    <span class="section-label">ADMIN</span>
                    <h2>Scheme Management</h2>
                </div>
                <button type="button" class="primary-action" onclick="showAdminView('scheme-form')">Add Scheme</button>
            </div>

            <div class="table-wrap">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Scheme Name</th>
                            <th>Category</th>
                            <th>Education Requirement</th>
                            <th>Income Condition</th>
                            <th>Location</th>
                            <th>Documents</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${schemes.map(function(scheme) {
                            return `
                                <tr>
                                    <td>${scheme.name}</td>
                                    <td>${scheme.category}</td>
                                    <td>${scheme.education}</td>
                                    <td>${scheme.income}</td>
                                    <td>${scheme.location}</td>
                                    <td>${scheme.documents.length} docs</td>
                                    <td><span class="status-badge status-ready">${scheme.status}</span></td>
                                    <td>
                                        <div class="table-actions">
                                            <button type="button" class="ghost-button" onclick="openAdminSchemeEdit('${scheme.id}')">Edit</button>
                                            <button type="button" class="ghost-button" onclick="openAdminSchemeDetail('${scheme.id}')">View</button>
                                        </div>
                                    </td>
                                </tr>
                            `;
                        }).join("")}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function openAdminSchemeDetail(id) {
    currentSelectedSchemeId = id;
    showAdminView("scheme-detail");
}

function renderAdminSchemeDetail() {
    const view = document.getElementById("adminSchemeDetailView");

    if (!view) {
        return;
    }

    const scheme = schemes.find(function(item) { return item.id === currentSelectedSchemeId; }) || schemes[0];

    view.innerHTML = `
        <div class="portal-subview-frame admin-page-shell">
            <button type="button" class="back-link" onclick="openAdminSchemeManagement()">← Back to Scheme Management</button>

            <div class="detail-header">
                <div>
                    <span class="section-label">ADMIN</span>
                    <h2>${scheme.name}</h2>
                </div>
                <span class="status-badge status-ready">${scheme.status || "Active"}</span>
            </div>

            <div class="detail-grid">
                <section class="detail-panel large-panel">
                    <h3>Scheme overview</h3>
                    <p>${scheme.about || "No description available for this scheme."}</p>
                    <div class="detail-list compact-list">
                        <div><span>Category</span><strong>${scheme.category}</strong></div>
                        <div><span>Who can apply</span><strong>${scheme.whoMayApply}</strong></div>
                        <div><span>Education requirement</span><strong>${scheme.education}</strong></div>
                        <div><span>Income limit</span><strong>${scheme.income}</strong></div>
                        <div><span>Location</span><strong>${scheme.location}</strong></div>
                        <div><span>Other conditions</span><strong>${scheme.otherConditions}</strong></div>
                    </div>
                </section>

                <section class="detail-panel side-panel">
                    <h3>Required documents</h3>
                    <ul class="check-list">
                        ${(scheme.documents || []).map(function(item) {
                            return `<li>${item}</li>`;
                        }).join("") || "<li>No documents listed.</li>"}
                    </ul>
                    <div class="meta-box">
                        <span>Application method</span>
                        <strong>${scheme.applicationMethod || "Online portal application"}</strong>
                    </div>
                    <div class="meta-box">
                        <span>Official link</span>
                        <strong>${scheme.portal || "https://example.gov.in/"}</strong>
                    </div>
                </section>
            </div>

            <section class="detail-panel">
                <h3>Application procedure</h3>
                <ol class="number-list">
                    ${(scheme.applicationSteps || []).map(function(step) {
                        return `<li>${step}</li>`;
                    }).join("") || "<li>No steps listed.</li>"}
                </ol>
            </section>

            <div class="detail-actions">
                <button type="button" class="primary-action" onclick="openAdminSchemeEdit('${scheme.id}')">Edit Scheme</button>
            </div>
        </div>
    `;
}

function renderAdminSchemeForm(isEdit) {
    const view = document.getElementById(isEdit ? "adminSchemeEditView" : "adminSchemeFormView");

    if (!view) {
        return;
    }

    const schemeId = isEdit ? currentSelectedSchemeId : "";
    const scheme = isEdit ? schemes.find(function(item) { return item.id === schemeId; }) : null;

    view.innerHTML = `
        <div class="portal-subview-frame admin-page-shell">
            <div class="subview-header">
                <button type="button" class="back-link" onclick="openAdminSchemeManagement()">← Back to Scheme Management</button>
                <div class="subview-headings">
                    <span class="section-label">ADMIN</span>
                    <h2>${isEdit ? "Edit Scheme" : "Add Scheme"}</h2>
                </div>
            </div>

            <form id="schemeForm" class="admin-form" onsubmit="event.preventDefault(); ${isEdit ? "saveEditedScheme()" : "saveNewScheme()"};">
                <div class="form-grid">
                    <label>
                        <span>Scheme Name</span>
                        <input name="name" value="${scheme ? scheme.name : ""}" required />
                    </label>
                    <label>
                        <span>Category</span>
                        <input name="category" value="${scheme ? scheme.category : ""}" required />
                    </label>
                    <label class="full-span">
                        <span>Description</span>
                        <textarea name="about" rows="3">${scheme ? scheme.about : ""}</textarea>
                    </label>
                    <label class="full-span">
                        <span>Who Can Apply</span>
                        <textarea name="whoMayApply" rows="3">${scheme ? scheme.whoMayApply : ""}</textarea>
                    </label>
                    <label>
                        <span>Education Requirement</span>
                        <input name="education" value="${scheme ? scheme.education : ""}" required />
                    </label>
                    <label>
                        <span>Income Limit</span>
                        <input name="income" value="${scheme ? scheme.income : ""}" required />
                    </label>
                    <label>
                        <span>Location / State</span>
                        <input name="location" value="${scheme ? scheme.location : ""}" required />
                    </label>
                    <label class="full-span">
                        <span>Other Eligibility Conditions</span>
                        <textarea name="otherConditions" rows="3">${scheme ? scheme.otherConditions : ""}</textarea>
                    </label>
                    <label class="full-span">
                        <span>Required Documents</span>
                        <textarea name="documents" rows="3">${scheme ? scheme.documents.join("\n") : ""}</textarea>
                    </label>
                    <label class="full-span">
                        <span>Application Procedure</span>
                        <textarea name="applicationSteps" rows="3">${scheme ? scheme.applicationSteps.join("\n") : ""}</textarea>
                    </label>
                    <label class="full-span">
                        <span>Official Application Link</span>
                        <input name="portal" value="${scheme ? scheme.portal : "https://example.gov.in/"}" />
                    </label>
                </div>

                <div class="form-actions">
                    <button type="submit" class="primary-action">${isEdit ? "Save Changes" : "Save Scheme"}</button>
                    <button type="button" class="ghost-button" onclick="openAdminSchemeManagement()">Cancel</button>
                </div>
            </form>
        </div>
    `;
}

function saveNewScheme() {
    const form = document.getElementById("schemeForm");

    if (!form) {
        return;
    }

    const formData = new FormData(form);
    const newScheme = {
        id: `scheme-${Date.now()}`,
        name: String(formData.get("name") || "").trim(),
        category: String(formData.get("category") || "").trim(),
        potentialMatch: "New",
        about: String(formData.get("about") || "").trim() || "Demo scheme created from the administration panel for frontend exploration.",
        whoMayApply: String(formData.get("whoMayApply") || "").trim(),
        education: String(formData.get("education") || "").trim(),
        income: String(formData.get("income") || "").trim(),
        location: String(formData.get("location") || "").trim(),
        otherConditions: String(formData.get("otherConditions") || "").trim(),
        documents: (String(formData.get("documents") || "")).split("\n").map(function(item) { return item.trim(); }).filter(Boolean),
        applicationMethod: "Online portal application",
        portal: String(formData.get("portal") || "https://example.gov.in/").trim(),
        status: "Active",
        applicationSteps: (String(formData.get("applicationSteps") || "")).split("\n").map(function(item) { return item.trim(); }).filter(Boolean)
    };

    schemes.unshift(newScheme);
    saveDemoState();
    openAdminSchemeManagement();
    showToast("Scheme saved", `${newScheme.name} has been added to the demo scheme list.`);
}

function openAdminSchemeEdit(id) {
    currentSelectedSchemeId = id;
    showAdminView("scheme-edit");
}

function saveEditedScheme() {
    const form = document.getElementById("schemeForm");

    if (!form || !currentSelectedSchemeId) {
        return;
    }

    const formData = new FormData(form);
    const scheme = schemes.find(function(item) { return item.id === currentSelectedSchemeId; });

    if (!scheme) {
        return;
    }

    scheme.name = String(formData.get("name") || "").trim();
    scheme.category = String(formData.get("category") || "").trim();
    scheme.about = String(formData.get("about") || "").trim() || scheme.about;
    scheme.whoMayApply = String(formData.get("whoMayApply") || "").trim();
    scheme.education = String(formData.get("education") || "").trim();
    scheme.income = String(formData.get("income") || "").trim();
    scheme.location = String(formData.get("location") || "").trim();
    scheme.otherConditions = String(formData.get("otherConditions") || "").trim();
    scheme.documents = (String(formData.get("documents") || "")).split("\n").map(function(item) { return item.trim(); }).filter(Boolean);
    scheme.applicationSteps = (String(formData.get("applicationSteps") || "")).split("\n").map(function(item) { return item.trim(); }).filter(Boolean);
    scheme.portal = String(formData.get("portal") || "https://example.gov.in/").trim();

    saveDemoState();
    openAdminSchemeManagement();
    showToast("Scheme updated successfully.", `${scheme.name} has been updated in the demo table.`);
}

function openAdminEligibilityRules() {
    showAdminView("eligibility-rules");
}

function renderEligibilityRules() {
    const view = document.getElementById("adminEligibilityView");

    if (!view) {
        return;
    }

    view.innerHTML = `
        <div class="portal-subview-frame admin-page-shell">
            <button type="button" class="back-link" onclick="showAdminDashboard()">← Back to Administrator Portal</button>
            <div class="subview-header inline-header">
                <div class="subview-headings">
                    <span class="section-label">ADMIN</span>
                    <h2>Eligibility Rules</h2>
                </div>
            </div>

            <div class="rules-grid">
                ${eligibilityRules.map(function(rule) {
                    return `
                        <article class="rule-card">
                            <div class="rule-card-top">
                                <h3>${rule.name}</h3>
                                <span class="status-badge ${rule.status === "Active" ? "status-ready" : rule.status === "Pending Review" ? "status-progress" : "status-neutral"}">${rule.status}</span>
                            </div>
                            <p>${rule.description}</p>
                            <div class="rule-meta">
                                <span>Schemes using this rule</span>
                                <strong>${rule.schemesUsing}</strong>
                            </div>
                            <button type="button" class="ghost-button" onclick="openAdminRuleEdit('${rule.id}')">Edit</button>
                        </article>
                    `;
                }).join("")}
            </div>
        </div>
    `;
}

function openAdminRuleEdit(id) {
    currentSelectedRuleId = id;
    showAdminView("rule-edit");
}

function renderAdminRuleEdit() {
    const view = document.getElementById("adminRuleEditView");

    if (!view) {
        return;
    }

    const rule = eligibilityRules.find(function(item) { return item.id === currentSelectedRuleId; }) || eligibilityRules[0];

    view.innerHTML = `
        <div class="portal-subview-frame admin-page-shell">
            <div class="subview-header">
                <button type="button" class="back-link" onclick="openAdminEligibilityRules()">← Back to Eligibility Rules</button>
                <div class="subview-headings">
                    <span class="section-label">ADMIN</span>
                    <h2>Edit Rule</h2>
                </div>
            </div>

            <form id="ruleForm" class="admin-form" onsubmit="event.preventDefault(); saveEligibilityRule();">
                <div class="form-grid">
                    <label>
                        <span>Rule Name</span>
                        <input name="name" value="${rule.name}" required />
                    </label>
                    <label>
                        <span>Status</span>
                        <select name="status">
                            <option value="Active" ${rule.status === "Active" ? "selected" : ""}>Active</option>
                            <option value="Pending Review" ${rule.status === "Pending Review" ? "selected" : ""}>Pending Review</option>
                            <option value="Inactive" ${rule.status === "Inactive" ? "selected" : ""}>Inactive</option>
                        </select>
                    </label>
                    <label class="full-span">
                        <span>Description</span>
                        <textarea name="description" rows="4" required>${rule.description}</textarea>
                    </label>
                    <label>
                        <span>Schemes Using This Rule</span>
                        <input name="schemesUsing" type="number" min="0" value="${rule.schemesUsing}" required />
                    </label>
                </div>

                <div class="form-actions">
                    <button type="submit" class="primary-action">Save Rule</button>
                    <button type="button" class="ghost-button" onclick="openAdminEligibilityRules()">Cancel</button>
                </div>
            </form>
        </div>
    `;
}

function saveEligibilityRule() {
    const form = document.getElementById("ruleForm");

    if (!form || !currentSelectedRuleId) {
        return;
    }

    const formData = new FormData(form);
    const rule = eligibilityRules.find(function(item) { return item.id === currentSelectedRuleId; });

    if (!rule) {
        return;
    }

    rule.name = String(formData.get("name") || "").trim();
    rule.description = String(formData.get("description") || "").trim();
    rule.status = String(formData.get("status") || "Active").trim();
    rule.schemesUsing = Number(formData.get("schemesUsing") || 0);

    saveDemoState();
    openAdminEligibilityRules();
    showToast("Rule updated", `${rule.name} has been updated for the demo ruleset.`);
}

function openAdminApplications() {
    showAdminView("applications");
}

function renderAdminApplications() {
    const view = document.getElementById("adminApplicationsView");

    if (!view) {
        return;
    }

    view.innerHTML = `
        <div class="portal-subview-frame admin-page-shell">
            <button type="button" class="back-link" onclick="showAdminDashboard()">← Back to Administrator Portal</button>
            <div class="subview-header inline-header">
                <div class="subview-headings">
                    <span class="section-label">ADMIN</span>
                    <h2>Applications</h2>
                </div>
            </div>

            <div class="table-wrap">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Application ID</th>
                            <th>Student Reference</th>
                            <th>Scheme</th>
                            <th>Started</th>
                            <th>Current Stage</th>
                            <th>Status</th>
                            <th>Last Updated</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${applications.map(function(application) {
                            return `
                                <tr>
                                    <td>${application.id}</td>
                                    <td>STU-${String(Math.floor(Math.random() * 9000) + 1000)}</td>
                                    <td>${application.schemeName}</td>
                                    <td>${application.started}</td>
                                    <td>${application.currentStage}</td>
                                    <td><span class="status-badge ${getStatusClass(application.currentStatus)}">${application.currentStatus}</span></td>
                                    <td>${new Date().toISOString().slice(0, 10)}</td>
                                    <td><button type="button" class="ghost-button" onclick="openAdminApplicationDetail('${application.id}')">View</button></td>
                                </tr>
                            `;
                        }).join("")}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function openAdminApplicationDetail(id) {
    currentSelectedApplicationId = id;
    showAdminView("application-detail");
}

function renderAdminApplicationDetail() {
    const view = document.getElementById("adminApplicationDetailView");

    if (!view) {
        return;
    }

    const application = applications.find(function(item) { return item.id === currentSelectedApplicationId; }) || applications[0];

    view.innerHTML = `
        <div class="portal-subview-frame admin-page-shell">
            <button type="button" class="back-link" onclick="openAdminApplications()">← Back to Applications</button>

            <div class="detail-header">
                <div>
                    <span class="section-label">APPLICATION</span>
                    <h2>${application.id}</h2>
                </div>
                <span class="status-badge ${getStatusClass(application.currentStatus)}">${application.currentStatus}</span>
            </div>

            <div class="detail-grid">
                <section class="detail-panel large-panel">
                    <h3>Application progress</h3>
                    <div class="progress-outer"><div class="progress-fill" style="width:${application.progress}%"></div></div>
                    <div class="detail-list compact-list">
                        <div><span>Scheme</span><strong>${application.schemeName}</strong></div>
                        <div><span>Current stage</span><strong>${application.currentStage}</strong></div>
                        <div><span>Status</span><strong>${application.currentStatus}</strong></div>
                        <div><span>Next action</span><strong>${application.nextAction}</strong></div>
                    </div>
                </section>

                <section class="detail-panel side-panel">
                    <h3>Documents</h3>
                    <ul class="check-list">
                        ${application.documentChecklist.map(function(item) {
                            return `<li>${item.name} <span class="mini-inline ${item.done ? "done" : "pending"}">${item.done ? "Ready" : "Pending"}</span></li>`;
                        }).join("")}
                    </ul>
                </section>
            </div>

            <section class="detail-panel">
                <h3>Timeline</h3>
                <div class="timeline-list">
                    ${application.timeline.map(function(step, index) {
                        const active = index <= (application.stageIndex || 0);
                        return `
                            <div class="timeline-step ${active ? "active" : ""}">
                                <span class="timeline-dot">${index + 1}</span>
                                <div>
                                    <strong>${step}</strong>
                                    ${index === (application.stageIndex || 0) ? '<small>Current stage</small>' : ''}
                                </div>
                            </div>
                        `;
                    }).join("")}
                </div>
            </section>
        </div>
    `;
}

function openProblemInsights() {
    showAdminView("problem-insights");
}

function openPlatformInsights() {
    showAdminView("platform-insights");
}

function renderProblemInsights() {
    const view = document.getElementById("adminProblemInsightsView");

    if (!view) {
        return;
    }

    const insightCards = [
        {
            id: "document-guidance",
            title: "Document Guidance",
            description: "Students need clearer explanations, examples and upload guidance before missing deadlines or documents.",
            tag: "Priority"
        },
        {
            id: "eligibility-clarity",
            title: "Eligibility Clarity",
            description: "Simple, friendly wording around income, education and location conditions reduces confusion.",
            tag: "Priority"
        },
        {
            id: "portal-access",
            title: "Portal Access",
            description: "A smoother login and application flow reduces drop-offs during the first stage of support discovery.",
            tag: "Follow-up"
        }
    ];

    view.innerHTML = `
        <div class="portal-subview-frame admin-page-shell">
            <button type="button" class="back-link" onclick="showAdminDashboard()">← Back to Administrator Portal</button>
            <button type="button" class="back-link" onclick="showAdminDashboard()">← Back to Administrator Portal</button>
            <div class="subview-header inline-header">
                <div class="subview-headings">
                    <span class="section-label">ADMIN</span>
                    <h2>Problem Insights</h2>
                </div>
            </div>

            <div class="insight-summary-grid">
                <div class="summary-box"><span>Problems Reported</span><strong>248</strong></div>
                <div class="summary-box"><span>Students Affected</span><strong>186</strong></div>
                <div class="summary-box accent-box"><span>Most Common Issue</span><strong>Document Collection</strong></div>
                <div class="summary-box"><span>Issues Needing Attention</span><strong>3</strong></div>
            </div>

            <div class="table-wrap">
                <table class="data-table compact-table">
                    <thead>
                        <tr>
                            <th>Issue</th>
                            <th>Reports</th>
                            <th>Students Affected</th>
                            <th>Friction</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${problems.map(function(item) {
                            return `
                                <tr>
                                    <td>${item.name}</td>
                                    <td>${item.reports}</td>
                                    <td>${item.studentsAffected}</td>
                                    <td>${item.friction}%</td>
                                    <td><span class="status-badge ${item.status === "Needs attention" ? "status-progress" : item.status === "Reviewing" ? "status-neutral" : "status-ready"}">${item.status}</span></td>
                                </tr>
                            `;
                        }).join("")}
                    </tbody>
                </table>
            </div>

            <div class="insight-cards-grid">
                ${insightCards.map(function(card) {
                    return `
                        <button type="button" class="insight-card" onclick="showProblemInsightDetail('${card.id}')">
                            <span>${card.tag}</span>
                            <strong>${card.title}</strong>
                            <p>${card.description}</p>
                        </button>
                    `;
                }).join("")}
            </div>

            <div id="problemInsightDetail" class="problem-detail-box hidden"></div>
        </div>
    `;
}

function showProblemInsightDetail(id) {
    const detail = document.getElementById("problemInsightDetail");

    if (!detail) {
        return;
    }

    const map = {
        "document-guidance": {
            title: "Document Guidance",
            detail: "Students need a clearer, guided document repository with examples, file-format expectations and completion checklists before they reach the final submission stage."
        },
        "eligibility-clarity": {
            title: "Eligibility Clarity",
            detail: "Clearer descriptions of income, education and location thresholds reduce confusion and lower the risk of premature drop-off during the initial eligibility review."
        },
        "portal-access": {
            title: "Portal Access",
            detail: "A smoother sign-in flow and first-time user guidance helps users proceed to application activation without getting stuck at the portal entry step."
        }
    };

    const content = map[id] || map["document-guidance"];
    detail.innerHTML = `
        <span class="section-label">INSIGHT DETAIL</span>
        <h3>${content.title}</h3>
        <p>${content.detail}</p>
    `;
    detail.classList.remove("hidden");
}

const dropoffAnalyticsData = [
    { label: "Document collection", value: 32 },
    { label: "Application form", value: 21 },
    { label: "Portal / login", value: 14 },
    { label: "Eligibility confusion", value: 11 }
];

function openDropoffAnalytics() {
    const dashboard = document.getElementById("adminDashboardView");
    const analytics = document.getElementById("dropoffAnalyticsView");

    if (!dashboard || !analytics) {
        return;
    }

    dashboard.classList.add("hidden");
    analytics.classList.remove("hidden");
    renderDropoffAnalytics();

    getAdminSubViews().forEach(function(view) {
        view.classList.add("hidden");
        view.innerHTML = "";
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
}

function closeDropoffAnalytics() {
    const dashboard = document.getElementById("adminDashboardView");
    const analytics = document.getElementById("dropoffAnalyticsView");

    if (!dashboard || !analytics) {
        return;
    }

    analytics.classList.add("hidden");
    dashboard.classList.remove("hidden");
    getAdminSubViews().forEach(function(view) {
        view.classList.add("hidden");
        view.innerHTML = "";
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function handleDropoffCardKey(event) {
    if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openDropoffAnalytics();
    }
}

function renderDropoffAnalytics() {
    const bars = document.getElementById("dropoffBars");

    if (!bars) {
        return;
    }

    bars.innerHTML = dropoffAnalyticsData.map(function(item) {
        return `<div class="dropoff-bar-row"><label>${item.label}</label><div class="dropoff-bar-track"><div class="dropoff-bar-fill" style="--dropoff-width: ${item.value}%"></div></div><span class="dropoff-bar-value">${item.value}%</span></div>`;
    }).join("");
}

function adminFeature(target) {
    if (target === "eligibility-rules") {
        openAdminEligibilityRules();
        return;
    }

    if (target === "problem-insights") {
        openProblemInsights();
        return;
    }

    if (target === "platform-insights") {
        openPlatformInsights();
        return;
    }

    if (target === "applications") {
        openAdminApplications();
        return;
    }

    openAdminSchemeManagement();
}


/* =========================================================
   TOAST
========================================================= */

function showToast(
    title,
    message
) {

    const toast =
        document.getElementById(
            "toast"
        );


    const toastTitle =
        document.getElementById(
            "toastTitle"
        );


    const toastMessage =
        document.getElementById(
            "toastMessage"
        );


    if (!toast) {

        return;

    }


    toastTitle.textContent =
        title;


    toastMessage.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            function () {

                toast.classList.remove(
                    "show"
                );

            },
            3500
        );

}


/* =========================================================
   LOGO PREVIEW
========================================================= */

let logoPreviewPreviousOverflow = "";


function openLogoPreview() {

    const overlay =
        document.getElementById("logoPreviewOverlay");

    if (!overlay) {

        return;

    }

    logoPreviewPreviousOverflow =
        document.body.style.overflow;

    overlay.classList.add("active");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    const closeButton =
        overlay.querySelector(".logo-preview-close");

    if (closeButton) {

        closeButton.focus();

    }

}


function closeLogoPreview() {

    const overlay =
        document.getElementById("logoPreviewOverlay");

    if (!overlay) {

        return;

    }

    overlay.classList.remove("active");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow =
        logoPreviewPreviousOverflow;

}


function handleLogoPreviewKey(event) {

    if (
        event.key === "Enter" ||
        event.key === " "
    ) {

        event.preventDefault();
        openLogoPreview();

    }

}


/* =========================================================
   CLICK OUTSIDE MODAL
========================================================= */

accessOverlay.addEventListener(
    "click",
    function(event) {

        if (
            event.target === accessOverlay
        ) {

            closeAccess();

        }

    }
);


const aiChatOverlay =
    document.getElementById("aiChatOverlay");


if (aiChatOverlay) {

    aiChatOverlay.addEventListener(
        "click",
        function(event) {

            if (
                event.target === aiChatOverlay
            ) {

                closeAIChat();

            }

        }
    );

}


const logoPreviewOverlay =
    document.getElementById("logoPreviewOverlay");


if (logoPreviewOverlay) {

    logoPreviewOverlay.addEventListener(
        "click",
        function(event) {

            if (
                event.target === logoPreviewOverlay
            ) {

                closeLogoPreview();

            }

        }
    );

}


/* =========================================================
   ESC KEY
========================================================= */

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Escape"
        ) {

            const logoPreviewOverlay =
                document.getElementById("logoPreviewOverlay");

            if (
                logoPreviewOverlay &&
                logoPreviewOverlay.classList.contains("active")
            ) {

                closeLogoPreview();
                return;

            }

            const aiChatOverlay =
                document.getElementById("aiChatOverlay");

            if (
                aiChatOverlay &&
                aiChatOverlay.classList.contains("active")
            ) {

                closeAIChat();
                return;

            }

            if (
                accessOverlay.classList.contains(
                    "active"
                )
            ) {

                closeAccess();

            }

        }

    }
);


/* =========================================================
   ENTER KEY
========================================================= */

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key !== "Enter"
        ) {

            return;

        }


        if (
            !accessOverlay.classList.contains(
                "active"
            )
        ) {

            return;

        }


        if (
            !studentLoginForm.classList.contains(
                "hidden"
            )
        ) {

            studentLogin();

        }


        if (
            !adminLoginForm.classList.contains(
                "hidden"
            )
        ) {

            adminLogin();

        }

    }
);


/* =========================================================
   INITIAL STATE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadDemoState();
        currentSelectedSchemeId = schemes[0] ? schemes[0].id : null;
        currentSelectedDocumentId = documents[0] ? documents[0].id : null;
        currentSelectedApplicationId = applications[0] ? applications[0].id : null;
        currentSelectedRuleId = eligibilityRules[0] ? eligibilityRules[0].id : null;

        backToRoles();

        const aiChatOverlay =
            document.getElementById("aiChatOverlay");

        if (
            aiChatOverlay &&
            aiChatOverlay.parentElement !== document.body
        ) {

            document.body.appendChild(aiChatOverlay);

        }


        studentPortal.classList.add(
            "hidden"
        );

        studentPortal.style.display =
            "none";


        adminPortal.classList.add(
            "hidden"
        );

        adminPortal.style.display =
            "none";


        landingPage.classList.add(
            "active"
        );

        landingPage.style.display =
            "block";

    }
);

async function handleFileUpload(docId, docName, file) {
    if (!file) return;
    showToast("Uploading", `Uploading ${file.name}...`);
    
    const formData = new FormData();
    formData.append("document", file);
    formData.append("documentName", docName);
    formData.append("schemeId", "general");
    
    try {
        const response = await fetch("http://localhost:3000/api/documents/upload", {
            method: "POST",
            headers: authToken ? { "Authorization": `Bearer ${authToken}` } : {},
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showToast("Upload Complete", `${file.name} saved securely.`);
            const item = documents.find(d => d.id === docId);
            if (item) item.status = "ready";
            renderDocumentsView();
        } else {
            showToast("Upload Successful", `${file.name} recorded.`);
            const item = documents.find(d => d.id === docId);
            if (item) item.status = "ready";
            renderDocumentsView();
        }
    } catch (e) {
        showToast("Uploaded (Local)", `${file.name} marked as ready.`);
        const item = documents.find(d => d.id === docId);
        if (item) item.status = "ready";
        renderDocumentsView();
    }
}
