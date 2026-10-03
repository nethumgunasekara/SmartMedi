const app = document.getElementById("app");

let currentUser = null;
let currentView = "dashboard";
let qrScanner = null;

const cache = {
    prescriptions: []
};


/*UTILITY*/

function esc(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function showToast(message) {

    let toast = document.querySelector(".toast");

    if (!toast) {

        document.body.insertAdjacentHTML(
            "beforeend",
            `<div class="toast"></div>`
        );

        toast = document.querySelector(".toast");
    }

    toast.textContent = message;
    toast.style.display = "block";

    setTimeout(() => {
        toast.style.display = "none";
    }, 3000);
}


async function api(url, options = {}) {

    const response = await fetch(url, {

        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        },

        ...options
    });

    if (!response.ok) {

        let message = "Request failed";

        try {

            const data = await response.json();

            message =
                data.message ||
                data.error ||
                data.detail ||
                message;

        } catch (_) {

            try {
                message = await response.text();
            } catch (_) {}
        }

        throw new Error(message);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}


/*LOGIN*/

function renderLogin() {

    app.innerHTML = `

        <div class="login-page">

            <div class="login-card">

                <div class="login-logo">
                    Smart<span>Medi</span>
                </div>

                <div class="login-subtitle">

                    Web-Based Pharmacy Management System
                    <br>
                    Prescription Management Module

                </div>


                <form id="loginForm">

                    <div class="field">

                        <label>
                            Email Address
                        </label>

                        <input
                            type="email"
                            id="loginEmail"
                            placeholder="Enter your email"
                            required
                        >

                    </div>


                    <div class="field">

                        <label>
                            Password
                        </label>

                        <input
                            type="password"
                            id="loginPassword"
                            placeholder="Enter your password"
                            required
                        >

                    </div>


                    <button
                        type="submit"
                        class="btn btn-primary login-button"
                    >
                        Login
                    </button>

                </form>


                <div class="login-demo">

                    <strong>
                        Demo Accounts
                    </strong>

                    <br>

                    Doctor:
                    <code>doctor@smartmedi.com</code>
                    /
                    <code>1234</code>

                    <br>

                    Pharmacist:
                    <code>pharmacist@smartmedi.com</code>
                    /
                    <code>1234</code>

                </div>

            </div>

        </div>
    `;


    document
        .getElementById("loginForm")
        .addEventListener("submit", login);
}


async function login(event) {

    event.preventDefault();

    const email =
        document
            .getElementById("loginEmail")
            .value
            .trim();

    const password =
        document
            .getElementById("loginPassword")
            .value
            .trim();


    if (!email || !password) {

        showToast(
            "Please enter email and password."
        );

        return;
    }


    try {

        const user =
            await api("/api/auth/login", {

                method: "POST",

                body: JSON.stringify({
                    email: email,
                    password: password
                })

            });


        currentUser = user;

        sessionStorage.setItem(
            "smartmediUser",
            JSON.stringify(user)
        );


        showToast(
            "Login successful."
        );


        currentView = "dashboard";

        renderShell();

    } catch (error) {

        showToast(
            error.message ||
            "Invalid email or password."
        );
    }
}


function restoreUser() {

    const saved =
        sessionStorage.getItem(
            "smartmediUser"
        );


    if (!saved) {
        return false;
    }


    try {

        currentUser =
            JSON.parse(saved);

        return true;

    } catch (error) {

        sessionStorage.removeItem(
            "smartmediUser"
        );

        return false;
    }
}


function logout() {

    sessionStorage.removeItem(
        "smartmediUser"
    );

    currentUser = null;
    currentView = "dashboard";

    renderLogin();
}


/*MAIN SHELL*/

function renderShell() {

    app.innerHTML = `

        <div class="shell">

            <aside class="sidebar">

                <div class="brand">
                    Smart<span>Medi</span>
                </div>


                <nav class="nav">

                    <button
                        class="${
        currentView === "dashboard"
            ? "active"
            : ""
    }"
                        onclick="show('dashboard')"
                    >
                        Dashboard
                    </button>


                    <button
                        class="${
        currentView === "prescriptions"
            ? "active"
            : ""
    }"
                        onclick="show('prescriptions')"
                    >
                        Prescriptions
                    </button>

                </nav>


                <div class="role">

                    Logged in as

                    <br>

                    <b>
                        ${esc(currentUser.name)}
                    </b>

                    <br>

                    ${esc(currentUser.role)}

                    <br>
                    <br>

                    <button
                        class="btn btn-danger btn-sm"
                        onclick="logout()"
                    >
                        Logout
                    </button>

                </div>

            </aside>


            <main
                class="main"
                id="mainContent"
            ></main>

        </div>
    `;


    show(currentView);
}


function show(view) {

    currentView = view;


    if (!currentUser) {

        renderLogin();

        return;
    }


    const main =
        document.getElementById(
            "mainContent"
        );


    if (!main) {

        renderShell();

        return;
    }


    document
        .querySelectorAll(".nav button")
        .forEach(button => {

            button.classList.remove(
                "active"
            );
        });


    const buttons =
        document.querySelectorAll(
            ".nav button"
        );


    if (
        currentView === "dashboard" &&
        buttons[0]
    ) {

        buttons[0].classList.add(
            "active"
        );
    }


    if (
        currentView === "prescriptions" &&
        buttons[1]
    ) {

        buttons[1].classList.add(
            "active"
        );
    }


    if (currentView === "dashboard") {
        dashboard();
    }


    if (currentView === "prescriptions") {
        prescriptions();
    }
}


/*DASHBOARD*/

async function dashboard() {

    const main =
        document.getElementById(
            "mainContent"
        );


    main.innerHTML = `

        <div class="top">

            <div>

                <h1>
                    Dashboard
                </h1>

                <p>
                    Welcome back,
                    ${esc(currentUser.name)}
                </p>

            </div>


            <div class="user-chip">

                <div class="avatar">

                    ${esc(
        currentUser.name
            .charAt(0)
            .toUpperCase()
    )}

                </div>


                <div>

                    ${esc(currentUser.name)}

                    <br>

                    <small>
                        ${esc(currentUser.role)}
                    </small>

                </div>

            </div>

        </div>


        <div id="dashboardContent">

            <div class="card">
                Loading dashboard...
            </div>

        </div>
    `;


    try {

        cache.prescriptions =
            await api(
                "/api/prescriptions"
            );


        renderDashboardData();

    } catch (error) {

        document.getElementById(
            "dashboardContent"
        ).innerHTML = `

            <div class="card">

                <h2>
                    Unable to load dashboard
                </h2>

                <p>
                    ${esc(error.message)}
                </p>

            </div>
        `;
    }
}


function renderDashboardData() {

    const list =
        cache.prescriptions;


    const total =
        list.length;


    const newCount =
        list.filter(
            p => p.status === "NEW"
        ).length;


    const completed =
        list.filter(
            p => p.status === "FULLY_DISPENSED"
        ).length;


    const cancelled =
        list.filter(
            p => p.status === "CANCELLED"
        ).length;


    const roleText =
        currentUser.role === "DOCTOR"
            ? "Create and manage electronic prescriptions."
            : "Verify and dispense electronic prescriptions.";


    document.getElementById(
        "dashboardContent"
    ).innerHTML = `

        <div class="hero">

            <div class="kicker">
                SMARTMEDI
            </div>


            <h2>
                ${
        currentUser.role === "DOCTOR"
            ? "Doctor Dashboard"
            : "Pharmacist Dashboard"
    }
            </h2>


            <p>

                ${roleText}

                Manage prescription records
                through the SmartMedi system.

            </p>


            <div class="actions">

                ${
        currentUser.role === "DOCTOR"

            ? `

                        <button
                            class="btn btn-primary"
                            onclick="openPrescriptionModal()"
                        >
                            + Create Prescription
                        </button>

                    `

            : `

                        <button
                            class="btn btn-ghost"
                            onclick="show('prescriptions')"
                        >
                            Verify Prescription
                        </button>

                    `
    }

            </div>

        </div>


        <div class="cards">

            <div class="card">

                <div class="metric">
                    ${total}
                </div>

                <div class="metric-label">
                    Total Prescriptions
                </div>

            </div>


            <div class="card">

                <div class="metric">
                    ${newCount}
                </div>

                <div class="metric-label">
                    New Prescriptions
                </div>

            </div>


            <div class="card">

                <div class="metric">
                    ${completed}
                </div>

                <div class="metric-label">
                    Completed
                </div>

            </div>


            <div class="card">

                <div class="metric">
                    ${cancelled}
                </div>

                <div class="metric-label">
                    Cancelled
                </div>

            </div>

        </div>


        <div class="three section">

            <div class="card">

                <div class="kicker">
                    REST API
                </div>

                <h3 style="margin-top:8px;">
                    Prescription CRUD
                </h3>

                <p
                    style="
                        margin-top:10px;
                        color:#6b7280;
                    "
                >
                    Create, read, update and delete
                    prescription records.
                </p>

            </div>


            <div class="card">

                <div class="kicker">
                    SAFETY
                </div>

                <h3 style="margin-top:8px;">
                    Safety Warning
                </h3>

                <p
                    style="
                        margin-top:10px;
                        color:#6b7280;
                    "
                >
                    Doctors can add safety
                    information to prescriptions.
                </p>

            </div>


            <div class="card">

                <div class="kicker">
                    QR
                </div>

                <h3 style="margin-top:8px;">
                    QR Verification
                </h3>

                <p
                    style="
                        margin-top:10px;
                        color:#6b7280;
                    "
                >
                    Prescriptions can be identified
                    using a QR code.
                </p>

            </div>

        </div>
    `;
}


/*PRESCRIPTIONS*/

function prescriptions() {

    if (
        currentUser.role === "PHARMACIST"
    ) {

        pharmacistVerification();

    } else {

        doctorPrescriptions();
    }
}


async function doctorPrescriptions() {

    const main =
        document.getElementById(
            "mainContent"
        );


    main.innerHTML = `

        <div class="top">

            <div>

                <h1>
                    Prescriptions
                </h1>

                <p>
                    Manage electronic prescription records
                </p>

            </div>


            <div class="user-chip">

                <div class="avatar">

                    ${esc(
        currentUser.name
            .charAt(0)
            .toUpperCase()
    )}

                </div>

                ${esc(currentUser.role)}

            </div>

        </div>


        <div class="section-head">

            <h2>
                Prescription Records
            </h2>


            <button
                class="btn btn-primary"
                onclick="openPrescriptionModal()"
            >
                + Create Prescription
            </button>

        </div>


        <div id="prescriptionTable">

            <div class="card">
                Loading prescriptions...
            </div>

        </div>
    `;


    try {

        cache.prescriptions =
            await api(
                "/api/prescriptions"
            );


        renderPrescriptionTable();

    } catch (error) {

        document.getElementById(
            "prescriptionTable"
        ).innerHTML = `

            <div class="card">

                <p>
                    ${esc(error.message)}
                </p>

            </div>
        `;
    }
}


function getMedicineNames(p) {

    if (
        !p.items ||
        !p.items.length
    ) {

        return "No medicines";
    }


    return p.items
        .map(item =>
            item.medicine
                ? item.medicine.name
                : "Unknown medicine"
        )
        .join(", ");
}


function getStatusClass(status) {

    if (
        status === "FULLY_DISPENSED" ||
        status === "APPROVED"
    ) {

        return "badge-good";
    }


    if (
        status === "CANCELLED" ||
        status === "EXPIRED"
    ) {

        return "badge-bad";
    }


    return "badge-warn";
}


/*PRESCRIPTION TABLE*/

function renderPrescriptionTable() {

    const container =
        document.getElementById(
            "prescriptionTable"
        );


    if (!cache.prescriptions.length) {

        container.innerHTML = `

            <div class="card empty">
                No prescriptions found.
            </div>

        `;

        return;
    }


    container.innerHTML = `

        <div class="table-wrap">

            <table>

                <thead>

                    <tr>

                        <th>ID</th>
                        <th>Patient</th>
                        <th>Doctor</th>
                        <th>Medicines</th>
                        <th>Valid Until</th>
                        <th>Status</th>
                        <th>QR</th>
                        <th>Actions</th>

                    </tr>

                </thead>


                <tbody>

                    ${
        cache.prescriptions
            .map(p => {

                const badge =
                    getStatusClass(
                        p.status
                    );


                return `

                                    <tr>

                                        <td>
                                            ${p.id}
                                        </td>


                                        <td>
                                            ${esc(
                    p.patientName
                )}
                                        </td>


                                        <td>
                                            ${esc(
                    p.doctorName
                )}
                                        </td>


                                        <td>
                                            ${esc(
                    getMedicineNames(p)
                )}
                                        </td>


                                        <td>
                                            ${esc(
                    p.validUntil
                )}
                                        </td>


                                        <td>

                                            <span
                                                class="badge ${badge}"
                                            >
                                                ${esc(
                    p.status
                )}
                                            </span>

                                        </td>


                                        <td>

                                            <button
                                                class="btn btn-primary btn-sm"
                                                onclick="showQrCode(${p.id})"
                                            >
                                                QR
                                            </button>

                                        </td>


                                        <td>

                                            <div
                                                style="
                                                    display:flex;
                                                    gap:6px;
                                                "
                                            >

                                                <button
                                                    class="btn btn-ghost btn-sm"
                                                    onclick="openPrescriptionModal(${p.id})"
                                                >
                                                    Edit
                                                </button>


                                                <button
                                                    class="btn btn-danger btn-sm"
                                                    onclick="deletePrescription(${p.id})"
                                                >
                                                    Delete
                                                </button>

                                            </div>


                                            ${
                    p.status === "NEW"

                        ? `

                                                        <div
                                                            style="
                                                                margin-top:6px;
                                                            "
                                                        >

                                                            <button
                                                                class="btn btn-primary btn-sm"
                                                                onclick="approvePrescription(${p.id})"
                                                            >
                                                                Approve
                                                            </button>

                                                        </div>

                                                    `

                        : ""
                }

                                        </td>

                                    </tr>

                                `;
            })
            .join("")
    }

                </tbody>

            </table>

        </div>

    `;
}


/*APPROVE PRESCRIPTION*/

async function approvePrescription(id) {

    if (
        !confirm(
            "Approve this prescription?"
        )
    ) {

        return;
    }


    try {

        const updated =
            await api(
                `/api/prescriptions/${id}/approve`,
                {
                    method: "PUT"
                }
            );


        showToast(
            "Prescription approved successfully."
        );


        await doctorPrescriptions();

    } catch (error) {

        showToast(
            error.message ||
            "Failed to approve prescription."
        );
    }
}


/*PHARMACIST VERIFICATION*/

function pharmacistVerification() {

    const main =
        document.getElementById(
            "mainContent"
        );


    main.innerHTML = `

        <div class="top">

            <div>

                <h1>
                    Prescription Verification
                </h1>

                <p>
                    Retrieve a prescription using its
                    Prescription ID or QR code
                </p>

            </div>


            <div class="user-chip">

                <div class="avatar">

                    ${esc(
        currentUser.name
            .charAt(0)
            .toUpperCase()
    )}

                </div>

                ${esc(
        currentUser.role
    )}

            </div>

        </div>


        <div class="card">

            <div class="kicker">
                PRESCRIPTION VERIFICATION
            </div>


            <h2 style="margin-top:8px;">
                Find Prescription
            </h2>


            <p
                style="
                    margin-top:10px;
                    color:#6b7280;
                "
            >
                Enter the Prescription ID or scan the
                patient's QR code.
            </p>


            <div
                class="form-row"
                style="margin-top:25px;"
            >

                <div class="field">

                    <label>
                        Prescription ID / QR Code
                    </label>


                    <input
                        type="text"
                        id="verificationCode"
                        placeholder="Enter RX-XXXXXXXX"
                    >

                </div>


                <div
                    class="field"
                    style="justify-content:flex-end;"
                >

                    <button
                        class="btn btn-primary"
                        onclick="verifyEnteredPrescription()"
                    >
                        Verify Prescription
                    </button>

                </div>

            </div>


            <div
                style="
                    text-align:center;
                    margin:15px 0;
                    color:#6b7280;
                    font-weight:700;
                "
            >
                OR
            </div>


            <div style="text-align:center;">

                <button
                    class="btn btn-primary"
                    onclick="openQrScanner()"
                >
                    Scan QR Code
                </button>

            </div>

        </div>


        <div id="verificationResult"></div>
    `;
}


async function verifyEnteredPrescription() {

    const code =
        document
            .getElementById(
                "verificationCode"
            )
            .value
            .trim();


    if (!code) {

        showToast(
            "Please enter a Prescription ID."
        );

        return;
    }


    await verifyPrescriptionCode(code);
}


async function verifyPrescriptionCode(code) {

    try {

        let url;


        if (
            /^\d+$/.test(code)
        ) {

            url =
                `/api/prescriptions/${code}`;

        } else {

            url =
                `/api/prescriptions/qr/${encodeURIComponent(code)}`;
        }


        const prescription =
            await api(url);


        showPrescription(
            prescription
        );

    } catch (error) {

        showToast(
            error.message ||
            "Prescription not found."
        );
    }
}


/* QR GENERATION*/

function showQrCode(id) {

    const prescription =
        cache.prescriptions.find(
            p => p.id === id
        );


    if (!prescription) {

        showToast(
            "Prescription not found."
        );

        return;
    }


    document.body.insertAdjacentHTML(
        "beforeend",
        `

        <div
            class="modal"
            id="prescriptionModal"
        >

            <div class="modal-card">

                <div class="modal-head">

                    <h2>
                        Prescription QR Code
                    </h2>


                    <button
                        class="close"
                        onclick="closeModal()"
                    >
                        ×
                    </button>

                </div>


                <div
                    style="
                        text-align:center;
                        padding:20px;
                    "
                >

                    <div
                        id="qrCodeBox"
                        style="
                            display:flex;
                            justify-content:center;
                            margin:20px 0;
                        "
                    ></div>


                    <h3>
                        ${esc(
            prescription.qrCode
        )}
                    </h3>


                    <p
                        style="
                            margin-top:8px;
                            color:#6b7280;
                        "
                    >

                        Prescription ID:
                        ${prescription.id}

                    </p>

                </div>


                <div class="form-actions">

                    <button
                        class="btn btn-primary"
                        onclick="closeModal()"
                    >
                        Close
                    </button>

                </div>

            </div>

        </div>
        `
    );


    new QRCode(
        document.getElementById(
            "qrCodeBox"
        ),
        {
            text: prescription.qrCode,
            width: 220,
            height: 220
        }
    );
}


/*QR SCANNER*/

function openQrScanner() {

    document.body.insertAdjacentHTML(
        "beforeend",
        `

        <div
            class="modal"
            id="prescriptionModal"
        >

            <div class="modal-card">

                <div class="modal-head">

                    <h2>
                        Scan Prescription QR
                    </h2>


                    <button
                        class="close"
                        onclick="closeModal()"
                    >
                        ×
                    </button>

                </div>


                <p
                    style="
                        margin-bottom:15px;
                        color:#6b7280;
                    "
                >
                    Allow camera access and scan the
                    patient's prescription QR code.
                </p>


                <div
                    id="qr-reader"
                    style="
                        width:100%;
                        max-width:500px;
                        margin:0 auto;
                    "
                ></div>

            </div>

        </div>
        `
    );


    if (
        typeof Html5Qrcode === "undefined"
    ) {

        showToast(
            "QR scanner library is not available."
        );

        return;
    }


    qrScanner =
        new Html5Qrcode(
            "qr-reader"
        );


    qrScanner.start(

        {
            facingMode: "environment"
        },

        {
            fps: 10,
            qrbox: 250
        },

        async decodedText => {

            await closeModal();

            showToast(
                "QR code scanned."
            );


            await verifyPrescriptionCode(
                decodedText
            );
        },

        () => {}

    ).catch(() => {

        showToast(
            "Unable to access camera."
        );
    });
}


/*PRESCRIPTION MODAL*/

function generateMedicineId() {

    return "MED-" +
        crypto.randomUUID()
            .substring(0, 8)
            .toUpperCase();
}


function medicineRowHtml(item = null) {

    const medicine =
        item && item.medicine
            ? item.medicine
            : null;


    return `

        <div
            class="card medicine-row"
            data-item-id="${
        item && item.id
            ? item.id
            : ""
    }"
            style="margin-bottom:15px;"
        >

            <div
                style="
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                "
            >

                <h3>
                    Medicine
                </h3>


                <button
                    type="button"
                    class="btn btn-danger btn-sm"
                    onclick="removeMedicineRow(this)"
                >
                    Remove
                </button>

            </div>


            <div class="form-row">

                <div class="field">

                    <label>
                        Medicine Name
                    </label>


                    <input
                        type="text"
                        class="medicine-name"
                        value="${
        medicine
            ? esc(medicine.name)
            : ""
    }"
                        placeholder="Enter medicine name"
                        required
                    >

                </div>


                <div class="field">

                    <label>
                        Brand
                    </label>


                    <input
                        type="text"
                        class="medicine-brand"
                        value="${
        medicine
            ? esc(medicine.brand)
            : ""
    }"
                        placeholder="Enter brand"
                    >

                </div>

            </div>


            <div class="form-row">

                <div class="field">

                    <label>
                        Unit Price
                    </label>


                    <input
                        type="number"
                        class="medicine-price"
                        min="0"
                        step="0.01"
                        value="${
        medicine
            ? medicine.unitPrice
            : 0
    }"
                    >

                </div>


                <div class="field">

                    <label>
                        Dosage
                    </label>


                    <input
                        type="text"
                        class="medicine-dosage"
                        value="${
        item
            ? esc(item.dosage)
            : ""
    }"
                        placeholder="e.g. 500mg"
                        required
                    >

                </div>

            </div>


            <div class="form-row">

                <div class="field">

                    <label>
                        Frequency
                    </label>


                    <input
                        type="text"
                        class="medicine-frequency"
                        value="${
        item
            ? esc(item.frequency)
            : ""
    }"
                        placeholder="e.g. 1-0-1"
                        required
                    >

                </div>


                <div class="field">

                    <label>
                        Duration (Days)
                    </label>


                    <input
                        type="number"
                        class="medicine-duration"
                        min="1"
                        value="${
        item
            ? item.durationDays
            : 1
    }"
                        required
                    >

                </div>

            </div>


            <div class="field">

                <label>
                    Quantity
                </label>


                <input
                    type="number"
                    class="medicine-quantity"
                    min="1"
                    value="${
        item
            ? item.quantityPrescribed
            : 1
    }"
                    required
                >

            </div>

        </div>
    `;
}


function openPrescriptionModal(id = null) {

    const prescription =
        id === null || id === undefined
            ? null
            : cache.prescriptions.find(
                p => String(p.id) === String(id)
            );


    document.body.insertAdjacentHTML(
        "beforeend",
        prescriptionModal(
            prescription
        )
    );
}


function prescriptionModal(
    prescription = null
) {

    const editing =
        !!prescription;


    const items =
        prescription &&
        prescription.items &&
        prescription.items.length

            ? prescription.items

            : [null];


    const medicineRows =
        items
            .map(item =>
                medicineRowHtml(item)
            )
            .join("");


    return `

        <div
            class="modal"
            id="prescriptionModal"
        >

            <div class="modal-card">

                <div class="modal-head">

                    <h2>

                        ${
        editing
            ? "Edit Prescription"
            : "Create Prescription"
    }

                    </h2>


                    <button
                        class="close"
                        onclick="closeModal()"
                    >
                        ×
                    </button>

                </div>


                <form
                    id="prescriptionForm"
                    onsubmit="
                        savePrescription(
                            event,
                            ${editing ? prescription.id : "null"}
                        )
                    "
                >

                    <div class="form-row">

                        <div class="field">

                            <label>
                                Patient Name
                            </label>


                            <input
                                type="text"
                                id="patientName"
                                value="${
        editing
            ? esc(
                prescription.patientName
            )
            : ""
    }"
                                placeholder="Enter patient name"
                                required
                            >

                        </div>


                        <div class="field">

                            <label>
                                Doctor Name
                            </label>


                            <input
                                type="text"
                                id="doctorName"
                                value="${
        editing
            ? esc(
                prescription.doctorName
            )
            : esc(
                currentUser.name
            )
    }"
                                placeholder="Enter doctor name"
                                required
                            >

                        </div>

                    </div>


                    <div class="field">

                        <label>
                            Valid Until
                        </label>


                        <input
                            type="date"
                            id="validUntil"
                            value="${
        editing
            ? prescription.validUntil
            : ""
    }"
                            required
                        >

                    </div>


                    <div class="field">

                        <label>
                            Safety Warning Type
                        </label>


                        <select
                            id="safetyWarningType"
                        >

                            <option value="">
                                Select warning type
                            </option>


                            <option
                                value="Allergy"
                                ${
        editing &&
        prescription.safetyWarningType ===
        "Allergy"
            ? "selected"
            : ""
    }
                            >
                                Allergy
                            </option>


                            <option
                                value="Drug Interaction"
                                ${
        editing &&
        prescription.safetyWarningType ===
        "Drug Interaction"
            ? "selected"
            : ""
    }
                            >
                                Drug Interaction
                            </option>


                            <option
                                value="Duplicate Medicine"
                                ${
        editing &&
        prescription.safetyWarningType ===
        "Duplicate Medicine"
            ? "selected"
            : ""
    }
                            >
                                Duplicate Medicine
                            </option>


                            <option
                                value="Unusual Dosage"
                                ${
        editing &&
        prescription.safetyWarningType ===
        "Unusual Dosage"
            ? "selected"
            : ""
    }
                            >
                                Unusual Dosage
                            </option>


                            <option
                                value="Special Warning"
                                ${
        editing &&
        prescription.safetyWarningType ===
        "Special Warning"
            ? "selected"
            : ""
    }
                            >
                                Special Warning
                            </option>

                        </select>

                    </div>


                    <div class="field">

                        <label>
                            Safety Warning Description
                        </label>


                        <textarea
                            id="safetyWarningDescription"
                            placeholder="Enter safety information"
                        >${
        editing
            ? esc(
                prescription.safetyWarningDescription ||
                ""
            )
            : ""
    }</textarea>

                    </div>


                    <div class="section-head">

                        <h3>
                            Prescription Medicines
                        </h3>


                        <button
                            type="button"
                            class="btn btn-primary btn-sm"
                            onclick="addMedicineRow()"
                        >
                            + Add Medicine
                        </button>

                    </div>


                    <div id="medicineItems">

                        ${medicineRows}

                    </div>


                    <div class="form-actions">

                        <button
                            type="button"
                            class="btn btn-ghost"
                            onclick="closeModal()"
                        >
                            Cancel
                        </button>


                        <button
                            type="submit"
                            class="btn btn-primary"
                        >

                            ${
        editing
            ? "Update Prescription"
            : "Create Prescription"
    }

                        </button>

                    </div>

                </form>

            </div>

        </div>
    `;
}


function addMedicineRow() {

    const container =
        document.getElementById(
            "medicineItems"
        );


    if (!container) {
        return;
    }


    container.insertAdjacentHTML(
        "beforeend",
        medicineRowHtml()
    );
}


function removeMedicineRow(button) {

    const row =
        button.closest(
            ".medicine-row"
        );


    if (row) {
        row.remove();
    }


    const rows =
        document.querySelectorAll(
            ".medicine-row"
        );


    if (rows.length === 0) {
        addMedicineRow();
    }
}


/*SAVE PRESCRIPTION*/

async function savePrescription(
    event,
    id
) {

    event.preventDefault();


    const prescriptionId =
        id !== null &&
        id !== undefined &&
        id !== ""
            ? Number(id)
            : null;


    const patientName =
        document
            .getElementById(
                "patientName"
            )
            .value
            .trim();


    const doctorName =
        document
            .getElementById(
                "doctorName"
            )
            .value
            .trim();


    const validUntil =
        document
            .getElementById(
                "validUntil"
            )
            .value;


    const safetyWarningType =
        document
            .getElementById(
                "safetyWarningType"
            )
            .value;


    const safetyWarningDescription =
        document
            .getElementById(
                "safetyWarningDescription"
            )
            .value
            .trim();


    if (
        !patientName ||
        !doctorName ||
        !validUntil
    ) {

        showToast(
            "Please fill all required fields."
        );

        return;
    }


    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    if (validUntil <= today) {

        showToast(
            "Validity date must be in the future."
        );

        return;
    }


    if (
        safetyWarningType &&
        !safetyWarningDescription
    ) {

        showToast(
            "Please enter a safety warning description."
        );

        return;
    }


    if (
        safetyWarningDescription &&
        !safetyWarningType
    ) {

        showToast(
            "Please select a safety warning type."
        );

        return;
    }


    const rows =
        document.querySelectorAll(
            ".medicine-row"
        );


    if (rows.length === 0) {

        showToast(
            "Please add at least one medicine."
        );

        return;
    }


    const items = [];


    for (const row of rows) {

        const medicineName =
            row.querySelector(
                ".medicine-name"
            ).value.trim();


        const brand =
            row.querySelector(
                ".medicine-brand"
            ).value.trim();


        const unitPrice =
            Number(
                row.querySelector(
                    ".medicine-price"
                ).value
            );


        const dosage =
            row.querySelector(
                ".medicine-dosage"
            ).value.trim();


        const frequency =
            row.querySelector(
                ".medicine-frequency"
            ).value.trim();


        const durationDays =
            Number(
                row.querySelector(
                    ".medicine-duration"
                ).value
            );


        const quantity =
            Number(
                row.querySelector(
                    ".medicine-quantity"
                ).value
            );


        if (
            !medicineName ||
            !dosage ||
            !frequency
        ) {

            showToast(
                "Please fill all medicine details."
            );

            return;
        }


        if (
            durationDays < 1 ||
            quantity < 1
        ) {

            showToast(
                "Duration and quantity must be at least 1."
            );

            return;
        }


        // Existing PrescriptionItem ID
        const itemId =
            row.getAttribute(
                "data-item-id"
            );


        items.push({

            // Existing item keeps its ID.
            // New item gets null.
            id:
                itemId
                    ? Number(itemId)
                    : null,

            medicine: {

                medicineId:
                    generateMedicineId(),

                name:
                medicineName,

                brand:
                brand,

                unitPrice:
                unitPrice

            },


            dosage:
            dosage,


            frequency:
            frequency,


            durationDays:
            durationDays,


            quantityPrescribed:
            quantity

        });
    }


    const data = {

        patientName:
        patientName,

        doctorName:
        doctorName,

        validUntil:
        validUntil,

        safetyWarningType:
            safetyWarningType || null,

        safetyWarningDescription:
            safetyWarningDescription || null,

        items:
        items
    };


    try {

        // CREATE
        if (prescriptionId === null) {

            await api(
                "/api/prescriptions",
                {
                    method: "POST",
                    body: JSON.stringify(data)
                }
            );


            showToast(
                "Prescription created successfully."
            );

        }


        // UPDATE
        else {

            await api(
                `/api/prescriptions/${prescriptionId}`,
                {
                    method: "PUT",
                    body: JSON.stringify(data)
                }
            );


            showToast(
                `Prescription #${prescriptionId} updated successfully.`
            );
        }


        await closeModal();

        await doctorPrescriptions();

    } catch (error) {

        showToast(
            error.message ||
            "Failed to save prescription."
        );
    }
}


/* =========================
   DELETE
   ========================= */

async function deletePrescription(id) {

    if (
        !confirm(
            "Are you sure you want to delete this prescription?"
        )
    ) {

        return;
    }


    try {

        await api(
            `/api/prescriptions/${id}`,
            {
                method: "DELETE"
            }
        );


        showToast(
            "Prescription deleted successfully."
        );


        await doctorPrescriptions();

    } catch (error) {

        showToast(
            error.message ||
            "Failed to delete prescription."
        );
    }
}


/*PRESCRIPTION DETAILS*/

function showPrescription(p) {

    const items =
        p.items || [];


    const canDispense =
        p.status === "APPROVED" ||
        p.status === "PARTIALLY_DISPENSED";


    const itemRows =
        items.length

            ? items
                .map(item => {

                    const medicine =
                        item.medicine || {};


                    const remaining =
                        Number(
                            item.remainingQuantity || 0
                        );


                    const canUseDispense =
                        canDispense &&
                        remaining > 0;


                    return `

                        <tr>

                            <td>
                                ${esc(
                        medicine.name ||
                        "Unknown"
                    )}
                            </td>


                            <td>
                                ${esc(
                        medicine.brand ||
                        "-"
                    )}
                            </td>


                            <td>
                                ${esc(
                        item.dosage
                    )}
                            </td>


                            <td>
                                ${esc(
                        item.frequency
                    )}
                            </td>


                            <td>
                                ${item.durationDays}
                                days
                            </td>


                            <td>
                                ${item.quantityPrescribed}
                            </td>


                            <td>

                                <b>
                                    ${remaining}
                                </b>

                            </td>


                            <td>

                                ${
                        canUseDispense

                            ? `

                                            <input
                                                type="number"
                                                min="1"
                                                max="${remaining}"
                                                id="dispense-${item.id}"
                                                value="1"
                                                style="
                                                    width:80px;
                                                    padding:8px;
                                                    margin-bottom:6px;
                                                "
                                            >


                                            <button
                                                class="btn btn-primary btn-sm"
                                                onclick="
                                                    dispenseMedicine(
                                                        ${p.id},
                                                        ${item.id}
                                                    )
                                                "
                                            >
                                                Dispense
                                            </button>

                                        `

                            : `

                                            ${
                                p.status === "NEW"

                                    ? `
                                                        <span class="badge badge-warn">
                                                            Waiting for Approval
                                                        </span>
                                                    `

                                    : p.status === "FULLY_DISPENSED"

                                        ? `
                                                            <span class="badge badge-good">
                                                                Fully Dispensed
                                                            </span>
                                                        `

                                        : p.status === "EXPIRED"

                                            ? `
                                                                <span class="badge badge-bad">
                                                                    Expired
                                                                </span>
                                                            `

                                            : p.status === "CANCELLED"

                                                ? `
                                                                    <span class="badge badge-bad">
                                                                        Cancelled
                                                                    </span>
                                                                `

                                                : `
                                                                    <span class="badge badge-good">
                                                                        No Quantity
                                                                    </span>
                                                                `
                            }

                                        `
                    }

                            </td>

                        </tr>
                    `;
                })
                .join("")

            : `

                <tr>

                    <td colspan="8">
                        No medicines found.
                    </td>

                </tr>
            `;


    const statusClass =
        getStatusClass(
            p.status
        );


    const approveButton =
        currentUser.role === "DOCTOR" &&
        p.status === "NEW"

            ? `

                <button
                    class="btn btn-primary"
                    onclick="approveFromDetails(${p.id})"
                >
                    Approve Prescription
                </button>

            `

            : "";


    document.body.insertAdjacentHTML(
        "beforeend",
        `

        <div
            class="modal"
            id="prescriptionModal"
        >

            <div class="modal-card">

                <div class="modal-head">

                    <h2>
                        Prescription Verification
                    </h2>


                    <button
                        class="close"
                        onclick="closeModal()"
                    >
                        ×
                    </button>

                </div>


                <div class="grid2">


                    <div class="card">

                        <strong>
                            Prescription ID
                        </strong>

                        <p>
                            ${p.id}
                        </p>

                    </div>


                    <div class="card">

                        <strong>
                            Status
                        </strong>

                        <p>

                            <span
                                class="badge ${statusClass}"
                            >
                                ${esc(
            p.status
        )}
                            </span>

                        </p>

                    </div>


                    <div class="card">

                        <strong>
                            Patient
                        </strong>

                        <p>
                            ${esc(
            p.patientName
        )}
                        </p>

                    </div>


                    <div class="card">

                        <strong>
                            Doctor
                        </strong>

                        <p>
                            ${esc(
            p.doctorName
        )}
                        </p>

                    </div>


                    <div class="card">

                        <strong>
                            Valid Until
                        </strong>

                        <p>
                            ${esc(
            p.validUntil
        )}
                        </p>

                    </div>

                </div>


                ${
            p.status === "NEW"

                ? `

                            <div
                                class="card"
                                style="
                                    margin-top:20px;
                                    border-left:5px solid #2563eb;
                                    background:#eff6ff;
                                "
                            >

                                <strong>
                                    Prescription Approval
                                </strong>

                                <p
                                    style="margin-top:8px;"
                                >
                                    This prescription must be approved
                                    before dispensing.
                                </p>

                            </div>

                        `

                : ""
        }


                ${
            p.status === "EXPIRED"

                ? `

                            <div
                                class="card"
                                style="
                                    margin-top:20px;
                                    border-left:5px solid #dc2626;
                                    background:#fef2f2;
                                "
                            >

                                <strong>
                                    Prescription Expired
                                </strong>

                                <p
                                    style="margin-top:8px;"
                                >
                                    This prescription is no longer valid.
                                    Dispensing is not allowed.
                                </p>

                            </div>

                        `

                : ""
        }


                <div
                    class="card"
                    style="
                        margin-top:20px;
                        overflow:auto;
                    "
                >

                    <h3>
                        Prescription Medicines
                    </h3>


                    <table
                        style="
                            width:100%;
                            margin-top:15px;
                        "
                    >

                        <thead>

                            <tr>

                                <th>
                                    Medicine
                                </th>

                                <th>
                                    Brand
                                </th>

                                <th>
                                    Dosage
                                </th>

                                <th>
                                    Frequency
                                </th>

                                <th>
                                    Duration
                                </th>

                                <th>
                                    Prescribed
                                </th>

                                <th>
                                    Remaining
                                </th>

                                <th>
                                    Dispense
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            ${itemRows}

                        </tbody>

                    </table>

                </div>


                <div
                    class="card"
                    style="
                        margin-top:20px;
                        border-left:5px solid #b45309;
                        background:#fffbeb;
                    "
                >

                    <strong>
                        Safety Warning
                    </strong>


                    <p
                        style="
                            margin-top:10px;
                            font-weight:700;
                        "
                    >
                        ${
            p.safetyWarningType
                ? esc(
                    p.safetyWarningType
                )
                : "No warning type specified"
        }
                    </p>


                    <p
                        style="
                            margin-top:6px;
                            color:#6b7280;
                        "
                    >
                        ${
            p.safetyWarningDescription
                ? esc(
                    p.safetyWarningDescription
                )
                : "No safety warning provided."
        }
                    </p>

                </div>


                <div
                    class="card"
                    style="
                        margin-top:20px;
                        text-align:center;
                    "
                >

                    <strong>
                        QR Prescription Identifier
                    </strong>


                    <div
                        id="verifyQrCode"
                        style="
                            display:flex;
                            justify-content:center;
                            margin:20px 0;
                        "
                    ></div>


                    <p
                        style="
                            font-size:20px;
                            font-weight:800;
                            color:#2563eb;
                        "
                    >
                        ${esc(
            p.qrCode
        )}
                    </p>

                </div>


                <div class="form-actions">

                    ${approveButton}


                    <button
                        class="btn btn-primary"
                        onclick="closeModal()"
                    >
                        Close
                    </button>

                </div>

            </div>

        </div>
        `
    );


    new QRCode(
        document.getElementById(
            "verifyQrCode"
        ),
        {
            text: p.qrCode,
            width: 180,
            height: 180
        }
    );
}


/*APPROVE FROM DETAILS*/

async function approveFromDetails(id) {

    try {

        const updated =
            await api(
                `/api/prescriptions/${id}/approve`,
                {
                    method: "PUT"
                }
            );


        await closeModal();


        showToast(
            "Prescription approved successfully."
        );


        showPrescription(
            updated
        );

    } catch (error) {

        showToast(
            error.message ||
            "Failed to approve prescription."
        );
    }
}


/*DISPENSING*/

async function dispenseMedicine(
    prescriptionId,
    itemId
) {

    const input =
        document.getElementById(
            `dispense-${itemId}`
        );


    if (!input) {
        return;
    }


    const quantity =
        Number(
            input.value
        );


    if (
        !quantity ||
        quantity < 1
    ) {

        showToast(
            "Enter a valid quantity."
        );

        return;
    }


    try {

        const updated =
            await api(
                `/api/prescriptions/${prescriptionId}/items/${itemId}/dispense?quantity=${quantity}`,
                {
                    method: "PUT"
                }
            );


        await closeModal();


        showToast(
            "Dispensing recorded successfully."
        );


        showPrescription(
            updated
        );

    } catch (error) {

        showToast(
            error.message ||
            "Failed to record dispensing."
        );
    }
}


/* MODAL */

async function closeModal() {

    if (qrScanner) {

        try {
            await qrScanner.stop();
        } catch (error) {}


        try {
            qrScanner.clear();
        } catch (error) {}


        qrScanner = null;
    }


    const modal =
        document.querySelector(
            ".modal"
        );


    if (modal) {
        modal.remove();
    }
}


/*START */

function init() {

    if (restoreUser()) {

        renderShell();

    } else {

        renderLogin();
    }
}


init();
