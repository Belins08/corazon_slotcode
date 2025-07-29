// Hostel data structure
let hostelData = null;
let currentSelectedRoom = null;

// Firebase data management functions
async function saveHostelDataToFirebase() {
    try {
        await db.collection('hostelData').doc('main').set({
            data: hostelData,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('Data saved to Firebase successfully');
    } catch (error) {
        console.error('Error saving to Firebase:', error);
        alert('Error saving data to Firebase: ' + error.message);
    }
}

async function loadHostelDataFromFirebase() {
    try {
        const doc = await db.collection('hostelData').doc('main').get();
        if (doc.exists) {
            hostelData = doc.data().data;
            return true;
        }
    } catch (error) {
        console.error('Error loading from Firebase:', error);
        alert('Error loading data from Firebase: ' + error.message);
    }
    return false;
}

// Save hostelData to Firebase
function saveHostelData() {
    saveHostelDataToFirebase();
}

// Load hostelData from Firebase
async function loadHostelData() {
    return await loadHostelDataFromFirebase();
}

// Initialize hostels with room data
function initializeHostels() {
    // If hostelData is already loaded from Firebase, skip initialization
    if (hostelData) return;
    hostelData = {
        1: {
            name: "Hostel 1",
            rooms: {}
        },
        2: {
            name: "Hostel 2", 
            rooms: {}
        }
    };
    const floors = [1, 2, 3];
    [1, 2].forEach(hostelId => {
        floors.forEach(floor => {
            const floorPrefix = floor === 1 ? 1 : floor === 2 ? 2 : 3;
            for (let room = 1; room <= 10; room++) {
                const roomNumber = `${floorPrefix}${room < 10 ? '0' : ''}${room}`;
                let roomPrice;
                if (hostelId === 1) {
                    roomPrice = 7200;
                } else {
                    if (floor === 1) {
                        roomPrice = 7200;
                    } else {
                        roomPrice = 7600;
                    }
                }
                hostelData[hostelId].rooms[`Room ${roomNumber}`] = {
                    code: generateRoomCode(),
                    student1: null,
                    studentId1: null,
                    tenantCode1: null,
                    student2: null,
                    studentId2: null,
                    tenantCode2: null,
                    status: 'available',
                    occupancy: 0,
                    roomPrice: roomPrice,
                    maintenanceFee: 400,
                    gender1: null,
                    gender2: null,
                    paid1: false, paid2: false,
                    paid3: false, paid4: false
                };
            }
        });
    });
    if (hostelData[2]) {
        hostelData[2].rooms['Room 211'] = {
            code: generateRoomCode(),
            student1: null, student2: null, student3: null,
            tenantCode1: null, tenantCode2: null, tenantCode3: null,
            status: 'available', occupancy: 0,
            roomPrice: null, maintenanceFee: null,
            gender1: null, gender2: null, gender3: null,
            paid1: false, paid2: false, paid3: false
        };
        hostelData[2].rooms['Room 401'] = {
            code: generateRoomCode(),
            student1: null, student2: null, student3: null, student4: null,
            tenantCode1: null, tenantCode2: null, tenantCode3: null, tenantCode4: null,
            status: 'available', occupancy: 0,
            roomPrice: null, maintenanceFee: null,
            gender1: null, gender2: null, gender3: null, gender4: null,
            paid1: false, paid2: false, paid3: false, paid4: false
        };
        hostelData[2].rooms['Room 402'] = {
            code: generateRoomCode(),
            student1: null, student2: null,
            tenantCode1: null, tenantCode2: null,
            status: 'available', occupancy: 0,
            roomPrice: null, maintenanceFee: null,
            gender1: null, gender2: null,
            paid1: false, paid2: false
        };
    }
    addSampleData();
}

function generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 3; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    code += '-';
    for (let i = 0; i < 4; i++) {
        code += Math.floor(Math.random() * 10);
    }
    return code;
}

function generateTenantCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'TNT-';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

function addSampleData() {
    // No sample data
}

// Render functions
function renderHostels() {
    const grid = document.getElementById('hostelGrid');
    grid.innerHTML = '';

    Object.keys(hostelData).forEach(hostelId => {
        const hostel = hostelData[hostelId];
        const hostelDiv = document.createElement('div');
        hostelDiv.className = 'hostel';
        
        hostelDiv.innerHTML = `
            <div class="hostel-header">${hostel.name}</div>
            <div class="room-grid" id="rooms-${hostelId}">
                ${renderRooms(hostelId)}
            </div>
        `;
        
        grid.appendChild(hostelDiv);
    });

    updateStats();
    saveHostelData();
    
    // Mobile-specific: Scroll to top after rendering
    if (isMobile()) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function renderRooms(hostelId) {
    const rooms = hostelData[hostelId].rooms;
    return Object.keys(rooms).map(roomKey => {
        const room = rooms[roomKey];
        let displayText = '';
        let priceInfo = '';
        
        if (room.status === 'available') {
            displayText = 'Available';
            if (room.roomPrice != null && room.maintenanceFee != null) {
                priceInfo = `₵${room.roomPrice} + ₵${room.maintenanceFee}`;
            } else {
                priceInfo = '';
            }
        } else if (room.status === 'partial') {
            displayText = room.student1;
            priceInfo = '1/2 occupied';
        } else if (room.status === 'full') {
            displayText = `${room.student1}<br>${room.student2}`;
            priceInfo = '2/2 occupied';
        } else if (room.status === 'reserved') {
            displayText = 'Reserved';
            priceInfo = 'Reserved';
        }
        
        return `
            <div class="room ${room.status}" onclick="showRoomDetails('${hostelId}', '${roomKey}')">
                <div class="status-indicator ${room.status}"></div>
                <div class="room-code">${roomKey}</div>
                <div class="student-name">${displayText}</div>
                <div class="student-id">${priceInfo}</div>
            </div>
        `;
    }).join('');
}

function updateStats() {
    let totalRooms = 0;
    let availableRooms = 0;
    let partialRooms = 0;
    let fullRooms = 0;
    let reservedRooms = 0;

    Object.values(hostelData).forEach(hostel => {
        Object.values(hostel.rooms).forEach(room => {
            totalRooms++;
            switch(room.status) {
                case 'available': availableRooms++; break;
                case 'partial': partialRooms++; break;
                case 'full': fullRooms++; break;
                case 'reserved': reservedRooms++; break;
            }
        });
    });

    document.getElementById('stats').innerHTML = `
        <div class="stat-card">
            <div class="stat-number total-stat">${totalRooms}</div>
            <div class="stat-label">Total Rooms</div>
        </div>
        <div class="stat-card">
            <div class="stat-number available-stat">${availableRooms}</div>
            <div class="stat-label">Available</div>
        </div>
        <div class="stat-card">
            <div class="stat-number occupied-stat">${partialRooms}</div>
            <div class="stat-label">Partial (1/2)</div>
        </div>
        <div class="stat-card">
            <div class="stat-number occupied-stat">${fullRooms}</div>
            <div class="stat-label">Full (2/2)</div>
        </div>
        <div class="stat-card">
            <div class="stat-number reserved-stat">${reservedRooms}</div>
            <div class="stat-label">Reserved</div>
        </div>
    `;
} 

// Export hostelData to Excel file
function exportExcel() {
    // Flatten hostelData for Excel
    let rows = [];
    Object.keys(hostelData).forEach(hostelId => {
        const hostel = hostelData[hostelId];
        Object.keys(hostel.rooms).forEach(roomKey => {
            const room = hostel.rooms[roomKey];
            let bedCount = 2;
            if ('student3' in room) bedCount = 3;
            if ('student4' in room) bedCount = 4;
            for (let i = 1; i <= bedCount; i++) {
                rows.push({
                    Hostel: hostel.name,
                    Room: roomKey,
                    Bed: i,
                    Student: room[`student${i}`] || '',
                    TenantCode: room[`tenantCode${i}`] || '',
                    Gender: room[`gender${i}`] || '',
                    Paid: room[`paid${i}`] ? 'Yes' : 'No',
                    RoomPrice: room.roomPrice || '',
                    MaintenanceFee: room.maintenanceFee || '',
                    Status: room.status
                });
            }
        });
    });
    // Create worksheet and workbook
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'HostelData');
    // Download Excel file
    XLSX.writeFile(wb, 'hostel_data.xlsx');
}

// Modal functions
function showRoomDetails(hostelId, roomKey) {
    const room = hostelData[hostelId].rooms[roomKey];
    currentSelectedRoom = {hostelId, roomKey};

    const modal = document.getElementById('roomModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');
    const vacateBtn = document.getElementById('vacateBtn');

    modalTitle.textContent = `${roomKey} - Hostel ${hostelId}`;
    let statusColor = room.status === 'available' ? '#27ae60' : 
                    room.status === 'partial' ? '#f39c12' :
                    room.status === 'full' ? '#e67e22' : '#e74c3c';

    // Determine number of beds
    let bedCount = 2;
    if ('student3' in room) bedCount = 3;
    if ('student4' in room) bedCount = 4;

    // Build bed assignment UI
    let bedsHtml = '';
    for (let i = 1; i <= bedCount; i++) {
        const student = room[`student${i}`];
        const tenantCode = room[`tenantCode${i}`];
        const paid = room[`paid${i}`];
        if (student) {
            const paidIcon = paid ? '<span title="Paid" style="color:green;font-size:1.2em;">✔️</span>' : '<span title="Unpaid" style="color:red;font-size:1.2em;">❌</span>';
            const paidBtn = `<button onclick="togglePaidStatus(${i})">Mark as ${paid ? 'Unpaid' : 'Paid'}</button>`;
            const removeBtn = `<button onclick="removeTenant(${i})" style="color:red;">Remove</button>`;
            bedsHtml += `<p><strong>🛏️ Bed ${i}:</strong> ${student} ${paidIcon} ${paidBtn} ${removeBtn}<br><small style="color: #666;">Tenant Code: ${tenantCode}</small></p>`;
        } else {
            bedsHtml += `<div style="margin-bottom:8px;"><strong>🛏️ Bed ${i}:</strong> <input type="text" id="assignBed${i}Name" placeholder="Enter student name"> <select id="assignBed${i}Gender"><option value="">Gender</option><option value="male">Male</option><option value="female">Female</option></select> <button onclick="assignToBed(${i})">Assign</button></div>`;
        }
    }

    const totalCost = room.roomPrice + room.maintenanceFee;

    modalContent.innerHTML = `
        <div style="margin-bottom: 20px;">
            <p><strong>Room Code:</strong> ${room.code}</p>
            <p><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${room.status.toUpperCase()}</span></p>
            <p><strong>Occupancy:</strong> ${room.occupancy}/${bedCount}</p>
            <hr style="margin: 15px 0;">
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <h4 style="margin: 0 0 10px 0; color: #2c3e50;">💰 Pricing Information</h4>
                <p><strong>Room Fee:</strong> ₵${room.roomPrice ? room.roomPrice.toLocaleString() : 'N/A'}</p>
                <p><strong>Maintenance Fee:</strong> ₵${room.maintenanceFee ? room.maintenanceFee.toLocaleString() : 'N/A'}</p>
                <p><strong>Total per Student:</strong> <span style="color: #e74c3c; font-weight: bold;">₵${totalCost ? totalCost.toLocaleString() : 'N/A'}</span></p>
            </div>
            <hr style="margin: 15px 0;">
            ${bedsHtml}
        </div>
    `;
    if (room.status === 'partial' || room.status === 'full') {
        vacateBtn.style.display = 'inline-block';
        vacateBtn.textContent = room.status === 'full' ? 'Manage Occupants' : 'Vacate Room';
    } else {
        vacateBtn.style.display = 'none';
    }
    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('roomModal').style.display = 'none';
    currentSelectedRoom = null;
}

function vacateRoom() {
    if (!currentSelectedRoom) return;

    const {hostelId, roomKey} = currentSelectedRoom;
    const room = hostelData[hostelId].rooms[roomKey];

    if (room.status === 'full') {
        // For full rooms, ask which student to remove
        const choice = confirm(`Room has 2 students:\nBed 1: ${room.student1} (${room.tenantCode1})\nBed 2: ${room.student2} (${room.tenantCode2})\n\nClick OK to remove Bed 1 student, Cancel to remove Bed 2 student`);
        
        if (choice) {
            // Remove student 1, move student 2 to bed 1
            room.student1 = room.student2;
            room.studentId1 = room.studentId2;
            room.tenantCode1 = room.tenantCode2;
            room.student2 = null;
            room.studentId2 = null;
            room.tenantCode2 = null;
        } else {
            // Remove student 2
            room.student2 = null;
            room.studentId2 = null;
            room.tenantCode2 = null;
        }
        room.status = 'partial';
        room.occupancy = 1;
    } else if (room.status === 'partial') {
        // Vacate the single student
        if (confirm(`Are you sure you want to vacate ${roomKey} for ${room.student1} (${room.tenantCode1})?`)) {
            room.student1 = null;
            room.studentId1 = null;
            room.tenantCode1 = null;
            room.status = 'available';
            room.occupancy = 0;
        }
    }

    renderHostels();
    closeModal();
    alert('Room updated successfully');
}

// Allocation functions
function assignAutoSlot() {
    const studentName = document.getElementById('autoStudentName').value.trim();
    const gender = document.getElementById('autoGender').value;
    const hostelId = document.getElementById('autoHostelSelect').value;
    if (!studentName || !hostelId || !gender) {
        alert('Please fill in all fields');
        return;
    }
    const hostel = hostelData[hostelId];
    let assignedRoom = null;
    let tenantCode = generateTenantCode();
    let assignedBed = null;
    // Try to fill partial rooms first
    for (let roomKey in hostel.rooms) {
        if (isFemaleForbiddenRoom(roomKey, gender)) continue;
        const room = hostel.rooms[roomKey];
        if (room.status === 'partial') {
            // Gender separation: only assign if existing occupant is same gender
            if ((room.gender1 && room.gender1 !== gender) || (room.gender2 && room.gender2 !== gender)) continue;
            room.student2 = studentName;
            room.tenantCode2 = tenantCode;
            room.gender2 = gender;
            room.status = 'full';
            room.occupancy = 2;
            assignedRoom = roomKey;
            assignedBed = 2;
            break;
        }
    }
    // If no partial rooms, assign to available room
    if (!assignedRoom) {
        for (let roomKey in hostel.rooms) {
            if (isFemaleForbiddenRoom(roomKey, gender)) continue;
            const room = hostel.rooms[roomKey];
            if (room.status === 'available') {
                room.student1 = studentName;
                room.tenantCode1 = tenantCode;
                room.gender1 = gender;
                room.status = 'partial';
                room.occupancy = 1;
                assignedRoom = roomKey;
                assignedBed = 1;
                break;
            }
        }
    }
    if (assignedRoom) {
        mobileAlert(`Assigned ${studentName} to ${assignedRoom} (Bed ${assignedBed}) in Hostel ${hostelId}. Tenant Token: ${tenantCode}`, 'success');
        document.getElementById('autoStudentName').value = '';
        document.getElementById('autoGender').value = '';
        renderHostels();
    } else {
        mobileAlert('No available beds in selected hostel for the selected gender', 'error');
    }
}

function assignManualSlot() {
    const studentName = document.getElementById('manualStudentName').value.trim();
    const gender = document.getElementById('manualGender').value;
    const hostelId = document.getElementById('manualHostelSelect').value;
    const roomKey = document.getElementById('manualRoomSelect').value;
    if (!studentName || !hostelId || !roomKey || !gender) {
        alert('Please fill in all fields');
        return;
    }
    if (isFemaleForbiddenRoom(roomKey, gender)) {
        alert('Females cannot be assigned to rooms 301-310.');
        return;
    }
    const room = hostelData[hostelId].rooms[roomKey];
    // Gender separation: only assign if room is empty or all occupants are same gender
    let occupantsGender = [];
    if (room.gender1) occupantsGender.push(room.gender1);
    if (room.gender2) occupantsGender.push(room.gender2);
    if (occupantsGender.length > 0 && occupantsGender.some(g => g !== gender)) {
        alert('Cannot mix genders in a room.');
        return;
    }
    const tenantCode = generateTenantCode();
    let assignedBed = null;
    if (!room.student1) {
        room.student1 = studentName;
        room.tenantCode1 = tenantCode;
        room.gender1 = gender;
        room.status = room.student2 ? 'partial' : 'partial';
        room.occupancy = room.student2 ? 2 : 1;
        assignedBed = 1;
    } else if (!room.student2) {
        room.student2 = studentName;
        room.tenantCode2 = tenantCode;
        room.gender2 = gender;
        room.status = 'full';
        room.occupancy = 2;
        assignedBed = 2;
    } else {
        alert('Room is already full');
        return;
    }
    mobileAlert(`Assigned ${studentName} to ${roomKey} (Bed ${assignedBed}) in Hostel ${hostelId}. Tenant Token: ${tenantCode}`, 'success');
    document.getElementById('manualStudentName').value = '';
    document.getElementById('manualGender').value = '';
    document.getElementById('manualHostelSelect').value = '';
    document.getElementById('manualRoomSelect').innerHTML = '<option value="">Select Room</option>';
    renderHostels();
}

// Allocation mode logic
let allocationMode = 'auto';
function setAllocationMode(mode) {
    allocationMode = mode;
    document.getElementById('autoForm').style.display = mode === 'auto' ? '' : 'none';
    document.getElementById('manualForm').style.display = mode === 'manual' ? '' : 'none';
    document.getElementById('autoModeBtn').classList.toggle('btn-primary', mode === 'auto');
    document.getElementById('autoModeBtn').classList.toggle('btn-secondary', mode !== 'auto');
    document.getElementById('manualModeBtn').classList.toggle('btn-primary', mode === 'manual');
    document.getElementById('manualModeBtn').classList.toggle('btn-secondary', mode !== 'manual');
}

// Update price preview for auto form
function updatePricePreview(form) {
    let hostelId = '';
    let previewId = '';
    if (form === 'auto') {
        hostelId = document.getElementById('autoHostelSelect').value;
        previewId = 'autoPricePreview';
    } else {
        hostelId = document.getElementById('manualHostelSelect').value;
        previewId = 'manualPricePreview';
    }
    let priceText = 'Select hostel to see pricing';
    if (hostelId === '1') priceText = '₵7,200 + ₵400';
    if (hostelId === '2') priceText = '₵7,200-₵7,600 + ₵400';
    document.getElementById(previewId).textContent = priceText;
}

// Populate manual room options based on hostel
function populateManualRoomOptions() {
    const hostelId = document.getElementById('manualHostelSelect').value;
    const gender = document.getElementById('manualGender').value;
    const roomSelect = document.getElementById('manualRoomSelect');
    roomSelect.innerHTML = '<option value="">Select Room</option>';
    if (!hostelId || !gender) return;
    const rooms = hostelData[hostelId].rooms;
    for (const roomKey in rooms) {
        if (isFemaleForbiddenRoom(roomKey, gender)) continue;
        const room = rooms[roomKey];
        if (room.status === 'full') continue;
        // Gender separation: only show rooms that are empty or have only same-gender occupants
        let occupantsGender = [];
        if (room.gender1) occupantsGender.push(room.gender1);
        if (room.gender2) occupantsGender.push(room.gender2);
        if (occupantsGender.length > 0 && occupantsGender.some(g => g !== gender)) continue;
        // Gather occupant names
        let occupants = [];
        if (room.student1) occupants.push(room.student1);
        if (room.student2) occupants.push(room.student2);
        let occupantsText = occupants.length > 0 ? occupants.join(', ') : 'Empty';
        // Show price details
        let priceText = `₵${room.roomPrice} + ₵${room.maintenanceFee}`;
        // Option text
        let optionText = `${roomKey} (${room.occupancy}/2) - [${occupantsText}] | ${priceText}`;
        roomSelect.innerHTML += `<option value="${roomKey}">${optionText}</option>`;
    }
}

// Add assignToBed function for admin assignment
function assignToBed(bedNumber) {
    if (!currentSelectedRoom) return;
    const {hostelId, roomKey} = currentSelectedRoom;
    const room = hostelData[hostelId].rooms[roomKey];
    const inputId = `assignBed${bedNumber}Name`;
    const studentName = document.getElementById(inputId).value.trim();
    const genderId = `assignBed${bedNumber}Gender`;
    let gender = '';
    const genderInput = document.getElementById(genderId);
    if (genderInput) {
        gender = genderInput.value;
    } else {
        gender = prompt('Enter gender for this bed (male/female):', '');
        if (!gender || (gender !== 'male' && gender !== 'female')) {
            alert('Please enter a valid gender (male or female)');
            return;
        }
    }
    if (isFemaleForbiddenRoom(roomKey, gender)) {
        alert('Females cannot be assigned to rooms 301-310.');
        return;
    }
    if (!studentName) {
        alert('Please enter a student name');
        return;
    }
    const tenantCode = generateTenantCode();
    // Gender separation: only assign if room is empty or all occupants are same gender
    let occupantsGender = [];
    for (let i = 1; i <= 4; i++) {
        if (i !== bedNumber && room[`gender${i}`]) occupantsGender.push(room[`gender${i}`]);
    }
    if (occupantsGender.length > 0 && occupantsGender.some(g => g !== gender)) {
        alert('Cannot mix genders in a room.');
        return;
    }
    if (!room[`student${bedNumber}`]) {
        room[`student${bedNumber}`] = studentName;
        room[`tenantCode${bedNumber}`] = tenantCode;
        room[`gender${bedNumber}`] = gender;
        room[`paid${bedNumber}`] = false; // Set paid status to false on assignment
    } else {
        alert('Bed already occupied');
        return;
    }
    // Update room status and occupancy
    let totalBeds = 2;
    if ('student3' in room) totalBeds = 3;
    if ('student4' in room) totalBeds = 4;
    let occ = 0;
    for (let i = 1; i <= totalBeds; i++) {
        if (room[`student${i}`]) occ++;
    }
    room.occupancy = occ;
    if (occ === totalBeds) {
        room.status = 'full';
    } else if (occ > 0) {
        room.status = 'partial';
    } else {
        room.status = 'available';
    }
    renderHostels();
    showRoomDetails(hostelId, roomKey);
    alert(`Assigned ${studentName} to Bed ${bedNumber} in ${roomKey}`);
}

// Add togglePaidStatus function
function togglePaidStatus(bedNumber) {
    if (!currentSelectedRoom) return;
    const {hostelId, roomKey} = currentSelectedRoom;
    const room = hostelData[hostelId].rooms[roomKey];
    if (room[`student${bedNumber}`]) {
        room[`paid${bedNumber}`] = !room[`paid${bedNumber}`];
        showRoomDetails(hostelId, roomKey);
    }
}

// Add removeTenant function
function removeTenant(bedNumber) {
    if (!currentSelectedRoom) return;
    const {hostelId, roomKey} = currentSelectedRoom;
    const room = hostelData[hostelId].rooms[roomKey];
    // Before clearing student data, capture values:
    const studentName = room[`student${bedNumber}`];
    const tenantCode = room[`tenantCode${bedNumber}`];
    room[`student${bedNumber}`] = null;
    room[`tenantCode${bedNumber}`] = null;
    room[`gender${bedNumber}`] = null;
    room[`paid${bedNumber}`] = false;
    // Update room status and occupancy
    let totalBeds = 2;
    if ('student3' in room) totalBeds = 3;
    if ('student4' in room) totalBeds = 4;
    let occ = 0;
    for (let i = 1; i <= totalBeds; i++) {
        if (room[`student${i}`]) occ++;
    }
    room.occupancy = occ;
    if (occ === totalBeds) {
        room.status = 'full';
    } else if (occ > 0) {
        room.status = 'partial';
    } else {
        room.status = 'available';
    }
    renderHostels();
    showRoomDetails(hostelId, roomKey);
}

// Utility functions
function clearAllAllocations() {
    if (confirm('Are you sure you want to clear all room allocations? This cannot be undone.')) {
        Object.values(hostelData).forEach(hostel => {
            Object.values(hostel.rooms).forEach(room => {
                room.student1 = null;
                room.studentId1 = null;
                room.tenantCode1 = null;
                room.student2 = null;
                room.studentId2 = null;
                room.tenantCode2 = null;
                room.status = 'available';
                room.occupancy = 0;
                room.gender1 = null;
                room.gender2 = null;
                room.paid1 = false;
                room.paid2 = false;
                room.paid3 = false;
                room.paid4 = false;
            });
        });
        renderHostels();
        alert('All allocations cleared - all slots are now vacant');
    }
}

function generateReport() {
    let report = 'HOSTEL ALLOCATION REPORT\n';
    report += '=' + '='.repeat(50) + '\n\n';

    let grandTotalRevenue = 0;
    let grandTotalStudents = 0;

    Object.keys(hostelData).forEach(hostelId => {
        const hostel = hostelData[hostelId];
        report += `${hostel.name}:\n`;
        report += '-'.repeat(30) + '\n';

        let totalStudents = 0;
        let totalBeds = Object.keys(hostel.rooms).length * 2;
        let hostelRevenue = 0;
        
        Object.keys(hostel.rooms).forEach(roomKey => {
            const room = hostel.rooms[roomKey];
            if (room.status === 'partial' || room.status === 'full') {
                const totalCost = room.roomPrice + room.maintenanceFee;
                report += `${roomKey} (${room.occupancy}/2) - ₵${room.roomPrice} + ₵${room.maintenanceFee} = ₵${totalCost} per student:\n`;
                
                if (room.student1) {
                    report += `  Bed 1: ${room.student1} (${room.studentId1}) - Tenant: ${room.tenantCode1}\n`;
                    totalStudents++;
                    hostelRevenue += totalCost;
                }
                if (room.student2) {
                    report += `  Bed 2: ${room.student2} (${room.studentId2}) - Tenant: ${room.tenantCode2}\n`;
                    totalStudents++;
                    hostelRevenue += totalCost;
                }
                report += '\n';
            }
        });

        report += `Total Students: ${totalStudents}/${totalBeds} beds\n`;
        report += `Occupancy Rate: ${((totalStudents/totalBeds)*100).toFixed(1)}%\n`;
        report += `Total Revenue: ₵${hostelRevenue.toLocaleString()}\n\n`;
        
        grandTotalRevenue += hostelRevenue;
        grandTotalStudents += totalStudents;
    });

    report += '=' + '='.repeat(50) + '\n';
    report += `GRAND TOTALS:\n`;
    report += `Total Students Across All Hostels: ${grandTotalStudents}\n`;
    report += `Total Revenue Generated: ₵${grandTotalRevenue.toLocaleString()}\n`;
    report += `Average Revenue per Student: ₵${grandTotalStudents > 0 ? (grandTotalRevenue/grandTotalStudents).toLocaleString() : 0}\n`;

    // Create downloadable report
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hostel_allocation_report.txt';
    a.click();
    URL.revokeObjectURL(url);
}

function exportData() {
    const data = JSON.stringify(hostelData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hostel_data.json';
    a.click();
    URL.revokeObjectURL(url);
}

// Helper to check if room is forbidden for females
function isFemaleForbiddenRoom(roomKey, gender) {
    if (gender !== 'female') return false;
    const match = roomKey.match(/^Room (\d{3})$/);
    if (match) {
        const num = parseInt(match[1], 10);
        if (num >= 301 && num <= 310) return true;
    }
    return false;
} 

// Search functionality
function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
    const resultsContainer = document.getElementById('searchResults');
    
    if (searchTerm.length < 2) {
        resultsContainer.style.display = 'none';
        return;
    }

    const results = searchHostelData(searchTerm);
    displaySearchResults(results, searchTerm);
}

function searchHostelData(searchTerm) {
    const results = [];
    
    Object.keys(hostelData).forEach(hostelId => {
        const hostel = hostelData[hostelId];
        Object.keys(hostel.rooms).forEach(roomKey => {
            const room = hostel.rooms[roomKey];
            
            // Search in student names
            for (let i = 1; i <= 4; i++) {
                const student = room[`student${i}`];
                const tenantCode = room[`tenantCode${i}`];
                const gender = room[`gender${i}`];
                
                if (student && (
                    student.toLowerCase().includes(searchTerm) ||
                    tenantCode.toLowerCase().includes(searchTerm) ||
                    roomKey.toLowerCase().includes(searchTerm) ||
                    hostel.name.toLowerCase().includes(searchTerm)
                )) {
                    results.push({
                        type: 'student',
                        hostelId: hostelId,
                        hostelName: hostel.name,
                        roomKey: roomKey,
                        student: student,
                        tenantCode: tenantCode,
                        gender: gender,
                        bedNumber: i,
                        room: room,
                        searchTerm: searchTerm
                    });
                }
            }
            
            // Search in room codes
            if (room.code && room.code.toLowerCase().includes(searchTerm)) {
                results.push({
                    type: 'room',
                    hostelId: hostelId,
                    hostelName: hostel.name,
                    roomKey: roomKey,
                    roomCode: room.code,
                    room: room,
                    searchTerm: searchTerm
                });
            }
        });
    });
    
    return results;
}

function displaySearchResults(results, searchTerm) {
    const resultsContainer = document.getElementById('searchResults');
    
    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="no-results">
                <div style="font-size: 2em; margin-bottom: 10px;">🔍</div>
                <div>No results found for "${searchTerm}"</div>
                <div style="font-size: 0.9em; margin-top: 5px;">Try searching for student names, room numbers, or tenant codes</div>
            </div>
        `;
        resultsContainer.style.display = 'block';
        return;
    }

    let html = `
        <div class="search-stats">
            Found ${results.length} result${results.length > 1 ? 's' : ''} for "${searchTerm}"
        </div>
    `;

    results.forEach(result => {
        if (result.type === 'student') {
            html += `
                <div class="search-result-item" onclick="showRoomDetails('${result.hostelId}', '${result.roomKey}')">
                    <div class="search-result-header">
                        <div>
                            <div class="search-result-title">
                                ${highlightText(result.student, searchTerm)}
                            </div>
                            <div class="search-result-subtitle">
                                ${result.hostelName} • ${result.roomKey} • Bed ${result.bedNumber}
                            </div>
                        </div>
                        <div style="color: ${result.gender === 'male' ? '#3498db' : '#e91e63'}; font-weight: bold;">
                            ${result.gender === 'male' ? '👨' : '👩'}
                        </div>
                    </div>
                    <div class="search-result-details">
                        <div class="search-result-detail">
                            <strong>Tenant Code:</strong> ${highlightText(result.tenantCode, searchTerm)}
                        </div>
                        <div class="search-result-detail">
                            <strong>Status:</strong> ${result.room.status}
                        </div>
                        <div class="search-result-detail">
                            <strong>Payment:</strong> ${result.room[`paid${result.bedNumber}`] ? '✅ Paid' : '❌ Unpaid'}
                        </div>
                    </div>
                </div>
            `;
        } else if (result.type === 'room') {
            html += `
                <div class="search-result-item" onclick="showRoomDetails('${result.hostelId}', '${result.roomKey}')">
                    <div class="search-result-header">
                        <div>
                            <div class="search-result-title">
                                ${result.roomKey} - ${result.hostelName}
                            </div>
                            <div class="search-result-subtitle">
                                Room Code: ${highlightText(result.roomCode, searchTerm)}
                            </div>
                        </div>
                        <div style="color: ${getStatusColor(result.room.status)}; font-weight: bold;">
                            ${result.room.status.toUpperCase()}
                        </div>
                    </div>
                    <div class="search-result-details">
                        <div class="search-result-detail">
                            <strong>Occupancy:</strong> ${result.room.occupancy}/2
                        </div>
                        <div class="search-result-detail">
                            <strong>Price:</strong> ₵${result.room.roomPrice || 'N/A'}
                        </div>
                        <div class="search-result-detail">
                            <strong>Maintenance:</strong> ₵${result.room.maintenanceFee || 'N/A'}
                        </div>
                    </div>
                </div>
            `;
        }
    });

    resultsContainer.innerHTML = html;
    resultsContainer.style.display = 'block';
}

function highlightText(text, searchTerm) {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<span class="search-highlight">$1</span>');
}

function getStatusColor(status) {
    switch(status) {
        case 'available': return '#27ae60';
        case 'partial': return '#f39c12';
        case 'full': return '#e67e22';
        case 'reserved': return '#e74c3c';
        default: return '#7f8c8d';
    }
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    document.getElementById('searchResults').style.display = 'none';
}

// Mobile-specific functions
function showMobileMenu() {
    document.getElementById('mobileMenuModal').style.display = 'block';
    // Add haptic feedback if available
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
}

function closeMobileMenu() {
    document.getElementById('mobileMenuModal').style.display = 'none';
}

function quickAssign() {
    closeMobileMenu();
    // Auto-fill with common values for quick assignment
    document.getElementById('autoStudentName').focus();
    setAllocationMode('auto');
    // Add haptic feedback
    if (navigator.vibrate) {
        navigator.vibrate(30);
    }
}

function showStats() {
    closeMobileMenu();
    // Scroll to stats section with smooth animation
    document.getElementById('stats').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
    // Add haptic feedback
    if (navigator.vibrate) {
        navigator.vibrate(30);
    }
}

function showLoading() {
    document.getElementById('loadingIndicator').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loadingIndicator').style.display = 'none';
}

// Enhanced mobile detection
function isMobile() {
    return window.innerWidth <= 768 || 
           /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Show/hide mobile elements based on screen size
function updateMobileElements() {
    const fab = document.getElementById('mobileFab');
    if (isMobile()) {
        fab.style.display = 'flex';
        // Add mobile-specific classes
        document.body.classList.add('mobile-view');
    } else {
        fab.style.display = 'none';
        document.body.classList.remove('mobile-view');
    }
}

// Enhanced pull-to-refresh functionality
let startY = 0;
let currentY = 0;
let pullDistance = 0;
const pullThreshold = 80;
let isPulling = false;

function handleTouchStart(e) {
    if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
        isPulling = false;
    }
}

function handleTouchMove(e) {
    if (window.scrollY === 0 && startY > 0) {
        currentY = e.touches[0].clientY;
        pullDistance = currentY - startY;
        
        if (pullDistance > 0) {
            e.preventDefault();
            isPulling = true;
            const pullRefresh = document.getElementById('pullRefresh');
            pullRefresh.style.display = 'block';
            pullRefresh.style.transform = `translateY(${Math.min(pullDistance, pullThreshold)}px)`;
            
            if (pullDistance > pullThreshold) {
                pullRefresh.textContent = 'Release to refresh';
                pullRefresh.style.color = '#27ae60';
            } else {
                pullRefresh.textContent = 'Pull down to refresh';
                pullRefresh.style.color = '#666';
            }
        }
    }
}

function handleTouchEnd() {
    if (isPulling && pullDistance > pullThreshold) {
        // Trigger refresh with haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
        }
        refreshData();
    }
    
    // Reset
    const pullRefresh = document.getElementById('pullRefresh');
    pullRefresh.style.display = 'none';
    pullRefresh.style.transform = 'translateY(0)';
    pullRefresh.style.color = '#666';
    startY = 0;
    pullDistance = 0;
    isPulling = false;
}

async function refreshData() {
    showLoading();
    try {
        await loadHostelData();
        renderHostels();
        mobileAlert('Data refreshed successfully!', 'success');
    } catch (error) {
        mobileAlert('Error refreshing data: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Enhanced mobile gesture support
function addMobileGestures() {
    if (isMobile()) {
        document.addEventListener('touchstart', handleTouchStart, { passive: false });
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', handleTouchEnd);
        
        // Add swipe gestures for room navigation
        addSwipeGestures();
    }
}

// Add swipe gestures for room navigation
function addSwipeGestures() {
    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;
    
    document.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchend', function(e) {
        endX = e.changedTouches[0].clientX;
        endY = e.changedTouches[0].clientY;
        
        const diffX = startX - endX;
        const diffY = startY - endY;
        
        // Only detect horizontal swipes
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
            if (diffX > 0) {
                // Swipe left - could be used for navigation
                console.log('Swipe left detected');
            } else {
                // Swipe right - could be used for navigation
                console.log('Swipe right detected');
            }
        }
    }, { passive: true });
}

// Add search to mobile menu
function addSearchToMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenuModal');
    if (mobileMenu) {
        const menuContent = mobileMenu.querySelector('.modal-content div');
        const searchButton = document.createElement('button');
        searchButton.className = 'btn';
        searchButton.textContent = '🔍 Search';
        searchButton.onclick = () => {
            closeMobileMenu();
            document.getElementById('searchInput').focus();
            // Add haptic feedback
            if (navigator.vibrate) {
                navigator.vibrate(30);
            }
        };
        menuContent.appendChild(searchButton);
    }
}

// Enhanced mobile-optimized alert function
function mobileAlert(message, type = 'info') {
    if (isMobile()) {
        // Remove existing alerts
        const existingAlerts = document.querySelectorAll('.mobile-alert');
        existingAlerts.forEach(alert => alert.remove());
        
        // Create a mobile-friendly alert
        const alertDiv = document.createElement('div');
        alertDiv.className = 'mobile-alert';
        alertDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 10px;
            right: 10px;
            background: ${type === 'error' ? '#e74c3c' : type === 'success' ? '#27ae60' : '#3498db'};
            color: white;
            padding: 15px 20px;
            border-radius: 12px;
            z-index: 3000;
            text-align: center;
            font-size: 1.1em;
            font-weight: 600;
            box-shadow: 0 8px 25px rgba(0,0,0,0.3);
            transform: translateY(-100px);
            opacity: 0;
            transition: all 0.3s ease;
            max-width: 90%;
            margin: 0 auto;
        `;
        
        // Add icon based on type
        const icon = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
        alertDiv.innerHTML = `${icon} ${message}`;
        
        document.body.appendChild(alertDiv);
        
        // Animate in
        setTimeout(() => {
            alertDiv.style.transform = 'translateY(0)';
            alertDiv.style.opacity = '1';
        }, 10);
        
        // Add haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(type === 'error' ? [200, 100, 200] : 50);
        }
        
        // Auto-remove after 4 seconds
        setTimeout(() => {
            alertDiv.style.transform = 'translateY(-100px)';
            alertDiv.style.opacity = '0';
            setTimeout(() => {
                if (alertDiv.parentNode) {
                    document.body.removeChild(alertDiv);
                }
            }, 300);
        }, 4000);
    } else {
        alert(message);
    }
}

// Enhanced room click handling for mobile
function showRoomDetails(hostelId, roomKey) {
    // Add haptic feedback for mobile
    if (isMobile() && navigator.vibrate) {
        navigator.vibrate(30);
    }
    
    const room = hostelData[hostelId].rooms[roomKey];
    currentSelectedRoom = {hostelId, roomKey};

    const modal = document.getElementById('roomModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');
    const vacateBtn = document.getElementById('vacateBtn');

    modalTitle.textContent = `${roomKey} - Hostel ${hostelId}`;
    let statusColor = room.status === 'available' ? '#27ae60' : 
                    room.status === 'partial' ? '#f39c12' :
                    room.status === 'full' ? '#e67e22' : '#e74c3c';

    // Determine number of beds
    let bedCount = 2;
    if ('student3' in room) bedCount = 3;
    if ('student4' in room) bedCount = 4;

    // Build bed assignment UI with mobile optimizations
    let bedsHtml = '';
    for (let i = 1; i <= bedCount; i++) {
        const student = room[`student${i}`];
        const tenantCode = room[`tenantCode${i}`];
        const paid = room[`paid${i}`];
        if (student) {
            const paidIcon = paid ? '<span title="Paid" style="color:green;font-size:1.2em;">✔️</span>' : '<span title="Unpaid" style="color:red;font-size:1.2em;">❌</span>';
            const paidBtn = `<button onclick="togglePaidStatus(${i})" class="btn" style="margin: 5px; padding: 8px 12px; font-size: 0.9em;">Mark as ${paid ? 'Unpaid' : 'Paid'}</button>`;
            const removeBtn = `<button onclick="removeTenant(${i})" class="btn btn-danger" style="margin: 5px; padding: 8px 12px; font-size: 0.9em;">Remove</button>`;
            bedsHtml += `<div style="margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 8px;"><strong>🛏️ Bed ${i}:</strong> ${student} ${paidIcon}<br><small style="color: #666;">Tenant Code: ${tenantCode}</small><br>${paidBtn} ${removeBtn}</div>`;
        } else {
            bedsHtml += `<div style="margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 8px;"><strong>🛏️ Bed ${i}:</strong><br><input type="text" id="assignBed${i}Name" placeholder="Enter student name" style="width: 100%; margin: 5px 0; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"><select id="assignBed${i}Gender" style="width: 100%; margin: 5px 0; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"><option value="">Gender</option><option value="male">Male</option><option value="female">Female</option></select><button onclick="assignToBed(${i})" class="btn btn-success" style="width: 100%; margin-top: 5px; padding: 8px;">Assign</button></div>`;
        }
    }

    const totalCost = room.roomPrice + room.maintenanceFee;

    modalContent.innerHTML = `
        <div style="margin-bottom: 20px;">
            <p><strong>Room Code:</strong> ${room.code}</p>
            <p><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${room.status.toUpperCase()}</span></p>
            <p><strong>Occupancy:</strong> ${room.occupancy}/${bedCount}</p>
            <hr style="margin: 15px 0;">
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <h4 style="margin: 0 0 10px 0; color: #2c3e50;">💰 Pricing Information</h4>
                <p><strong>Room Fee:</strong> ₵${room.roomPrice ? room.roomPrice.toLocaleString() : 'N/A'}</p>
                <p><strong>Maintenance Fee:</strong> ₵${room.maintenanceFee ? room.maintenanceFee.toLocaleString() : 'N/A'}</p>
                <p><strong>Total per Student:</strong> <span style="color: #e74c3c; font-weight: bold;">₵${totalCost ? totalCost.toLocaleString() : 'N/A'}</span></p>
            </div>
            <hr style="margin: 15px 0;">
            ${bedsHtml}
        </div>
    `;
    if (room.status === 'partial' || room.status === 'full') {
        vacateBtn.style.display = 'inline-block';
        vacateBtn.textContent = room.status === 'full' ? 'Manage Occupants' : 'Vacate Room';
    } else {
        vacateBtn.style.display = 'none';
    }
    modal.style.display = 'block';
}

// Enhanced mobile keyboard handling
function handleMobileKeyboard() {
    if (isMobile()) {
        // Prevent zoom on input focus
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('focus', function() {
                // Add a small delay to prevent zoom
                setTimeout(() => {
                    this.style.fontSize = '16px';
                }, 100);
            });
            
            input.addEventListener('blur', function() {
                this.style.fontSize = '';
            });
        });
    }
}

// Initialize the system with enhanced mobile features
async function initializeSystem() {
    showLoading();
    try {
        // On page load, load hostelData from Firebase if available
        if (!await loadHostelData()) {
            initializeHostels();
        }
        renderHostels();
        updateMobileElements();
        addMobileGestures();
        addSearchToMobileMenu();
        handleMobileKeyboard();
        
        // Add mobile-specific event listeners
        if (isMobile()) {
            // Prevent double-tap zoom
            let lastTouchEnd = 0;
            document.addEventListener('touchend', function(event) {
                const now = (new Date()).getTime();
                if (now - lastTouchEnd <= 300) {
                    event.preventDefault();
                }
                lastTouchEnd = now;
            }, false);
            
            // Add orientation change handling
            window.addEventListener('orientationchange', function() {
                setTimeout(updateMobileElements, 100);
            });
        }
    } catch (error) {
        mobileAlert('Error initializing system: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Initialize when page loads
initializeSystem();

// Update mobile elements on resize
window.addEventListener('resize', updateMobileElements);

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('roomModal');
    if (event.target === modal) {
        closeModal();
    }
} 
