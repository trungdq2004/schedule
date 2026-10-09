document.addEventListener('DOMContentLoaded', function() {
    let config = JSON.parse(localStorage.getItem('my_tkb_config')) || {
        morningCount: 4,
        afternoonCount: 4,
        times: {
            "S1": { start: "07:00", end: "07:45" },
            "S2": { start: "07:50", end: "08:35" },
            "S3": { start: "08:50", end: "09:35" },
            "S4": { start: "09:40", end: "10:25" },
            "S5": { start: "10:30", end: "11:15" },
            "S6": { start: "11:20", end: "12:05" },
            "C1": { start: "13:30", end: "14:15" },
            "C2": { start: "14:20", end: "15:05" },
            "C3": { start: "15:20", end: "16:05" },
            "C4": { start: "16:10", end: "16:55" },
            "C5": { start: "17:00", end: "17:45" },
            "C6": { start: "17:50", end: "18:35" }
        }
    };

    const dayNames = {
        2: { name: 'Thứ 2', short: 'T2' },
        3: { name: 'Thứ 3', short: 'T3' },
        4: { name: 'Thứ 4', short: 'T4' },
        5: { name: 'Thứ 5', short: 'T5' },
        6: { name: 'Thứ 6', short: 'T6' },
        7: { name: 'Thứ 7', short: 'T7' },
        8: { name: 'Chủ Nhật', short: 'CN' }
    };

    const vibrantColors = ["#0f766e", "#0369a1", "#0284c7", "#0891b2", "#15803d", "#b45309", "#c2410c", "#be123c", "#be185d", "#7c3aed"];

    function getColorForSubject(subjectName) {
        if (!subjectName) return vibrantColors[0];
        let hash = 0;
        for (let i = 0; i < subjectName.length; i++) {
            hash = subjectName.charCodeAt(i) + ((hash << 5) - hash);
        }
        return vibrantColors[Math.abs(hash) % vibrantColors.length];
    }

    const presetSubjects = {
        1: [{ name: "Tiếng Việt" }, { name: "Toán" }, { name: "Đạo đức" }, { name: "Tự nhiên và Xã hội" }, { name: "Mỹ thuật" }, { name: "Âm nhạc" }, { name: "Thể dục" }],
        6: [{ name: "Toán" }, { name: "Ngữ văn" }, { name: "Tiếng Anh" }, { name: "Lịch sử & Địa lý" }, { name: "Khoa học tự nhiên" }, { name: "Tin học" }, { name: "GDCD" }, { name: "Công nghệ" }, { name: "Thể dục" }],
        10: [{ name: "Toán" }, { name: "Ngữ văn" }, { name: "Tiếng Anh" }, { name: "Lịch sử" }, { name: "Địa lý" }, { name: "Vật lý" }, { name: "Hóa học" }, { name: "Sinh học" }, { name: "Tin học" }],
        "dai-hoc": [{ name: "Giải tích" }, { name: "Đại số tuyến tính" }, { name: "Triết học Mác-Lênin" }, { name: "Lập trình Web" }, { name: "Cơ sở dữ liệu" }],
        "tu-do": [{ name: "Học ngoại ngữ" }, { name: "Đọc sách" }, { name: "Tập gym" }]
    };

    let activeDays = [2, 3, 4, 5, 6, 7, 8];
    let selectedClass = "1";
    let scheduleTitle = localStorage.getItem('my_tkb_title') || 'Lịch học chi tiết Sáng — Chiều';

    let scheduleTitleElement = document.getElementById('scheduleTitle');
    scheduleTitleElement.textContent = scheduleTitle;
    const editTitleBtn = document.getElementById('editTitleBtn');
    let titleInput = null;

    editTitleBtn.onclick = () => {
        if (titleInput) {
            const trimmedTitle = titleInput.value.trim();
            if (!trimmedTitle) {
                titleInput.classList.add('border-rose-500', 'ring-2', 'ring-rose-200');
                titleInput.focus();
                return;
            }
            scheduleTitle = trimmedTitle;
            localStorage.setItem('my_tkb_title', scheduleTitle);
            scheduleTitleElement.textContent = scheduleTitle;
            titleInput.replaceWith(scheduleTitleElement);
            titleInput = null;
            editTitleBtn.textContent = 'Sửa tên';
            return;
        }

        titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.value = scheduleTitle;
        titleInput.maxLength = 80;
        titleInput.className = 'w-full max-w-xl p-2 bg-white border border-indigo-300 rounded-xl text-lg font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500';
        scheduleTitleElement.replaceWith(titleInput);
        editTitleBtn.textContent = 'Lưu tên';
        titleInput.focus();
        titleInput.select();

        titleInput.addEventListener('keydown', event => {
            if (event.key === 'Enter') {
                event.preventDefault();
                editTitleBtn.click();
            }
            if (event.key === 'Escape') {
                titleInput.replaceWith(scheduleTitleElement);
                titleInput = null;
                editTitleBtn.textContent = 'Sửa tên';
            }
        });
    };

    function showCustomAlert(title, message, type = 'info', onConfirm = null) {
        const modal = document.getElementById('customAlertModal');
        document.getElementById('alertTitle').textContent = title;
        document.getElementById('alertMessage').textContent = message;
        const alertButtons = document.getElementById('alertButtons');
        alertButtons.innerHTML = '';
        
        if (type === 'confirm') {
            const cancelBtn = document.createElement('button');
            cancelBtn.className = "flex-1 py-2.5 rounded-2xl text-xs font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 transition";
            cancelBtn.textContent = "Hủy bỏ";
            cancelBtn.onclick = () => { modal.classList.remove('flex'); modal.classList.add('hidden'); if(onConfirm) onConfirm(false); };

            const okBtn = document.createElement('button');
            okBtn.className = "flex-1 py-2.5 rounded-2xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition";
            okBtn.textContent = "Xác nhận";
            okBtn.onclick = () => { modal.classList.remove('flex'); modal.classList.add('hidden'); if(onConfirm) onConfirm(true); };

            alertButtons.append(cancelBtn, okBtn);
        } else {
            const okBtn = document.createElement('button');
            okBtn.className = "w-full py-2.5 rounded-2xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition";
            okBtn.textContent = "Đã hiểu";
            okBtn.onclick = () => { modal.classList.remove('flex'); modal.classList.add('hidden'); if(onConfirm) onConfirm(true); };
            alertButtons.append(okBtn);
        }
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    const settingsModal = document.getElementById('settingsModal');
    document.getElementById('openSettingsBtn').onclick = () => {
        document.getElementById('inputMorningCount').value = config.morningCount;
        document.getElementById('inputAfternoonCount').value = config.afternoonCount;
        renderSettingsTimeInputs();
        settingsModal.classList.remove('hidden');
        settingsModal.classList.add('flex');
    };
    document.getElementById('closeSettingsModalBtn').onclick = () => {
        settingsModal.classList.remove('flex');
        settingsModal.classList.add('hidden');
    };

    function renderSettingsTimeInputs() {
        const container = document.getElementById('periodTimesConfig');
        container.innerHTML = '';
        let mCount = parseInt(document.getElementById('inputMorningCount').value) || 0;
        let aCount = parseInt(document.getElementById('inputAfternoonCount').value) || 0;
        let periodConfigs = [];

        for (let i = 1; i <= mCount; i++) {
            periodConfigs.push({
                key: `S${i}`,
                label: `T${i}`,
                defaultTime: { start: "07:00", end: "07:45" }
            });
        }
        for (let i = 1; i <= aCount; i++) {
            periodConfigs.push({
                key: `C${i}`,
                label: `T${mCount + i}`,
                defaultTime: { start: "13:30", end: "14:15" }
            });
        }

        periodConfigs.forEach(period => {
            let t = config.times[period.key] || period.defaultTime;
            container.innerHTML += `
                <div class="flex items-center justify-between gap-2 bg-slate-50 p-2 rounded-xl text-xs">
                    <span class="font-bold w-16">Tiết ${period.label}</span>
                    <input type="text" value="${t.start}" data-key="${period.key}" data-type="start" class="w-28 p-2 border rounded-lg bg-white time-input text-center text-base font-medium" inputmode="numeric" maxlength="5" placeholder="HH:MM">
                    <span>đến</span>
                    <input type="text" value="${t.end}" data-key="${period.key}" data-type="end" class="w-28 p-2 border rounded-lg bg-white time-input text-center text-base font-medium" inputmode="numeric" maxlength="5" placeholder="HH:MM">
                </div>
            `;
        });
    }

    document.getElementById('inputMorningCount').addEventListener('input', renderSettingsTimeInputs);
    document.getElementById('inputAfternoonCount').addEventListener('input', renderSettingsTimeInputs);

    document.getElementById('saveSettingsBtn').onclick = () => {
        config.morningCount = parseInt(document.getElementById('inputMorningCount').value) || 0;
        config.afternoonCount = parseInt(document.getElementById('inputAfternoonCount').value) || 0;

        const validTime = value => {
            if (!/^\d{2}:\d{2}$/.test(value)) return false;
            let [hours, minutes] = value.split(':').map(Number);
            return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
        };

        let invalidTime = Array.from(document.querySelectorAll('.time-input'))
            .find(input => !validTime(input.value));
        if (invalidTime) {
            showCustomAlert("Lỗi", "Vui lòng nhập giờ theo dạng HH:MM, ví dụ 07:00.");
            invalidTime.focus();
            return;
        }
        
        document.querySelectorAll('.time-input').forEach(input => {
            let key = input.getAttribute('data-key');
            let type = input.getAttribute('data-type');
            if (!config.times[key]) config.times[key] = { start: "07:00", end: "07:45" };
            config.times[key][type] = input.value;
        });

        localStorage.setItem('my_tkb_config', JSON.stringify(config));
        settingsModal.classList.remove('flex');
        settingsModal.classList.add('hidden');
        renderTable();
    };

    function getActivePeriodsList() {
        let list = [];
        for (let i = 1; i <= config.morningCount; i++) {
            let key = `S${i}`;
            list.push({ id: key, name: `T${list.length + 1}`, time: config.times[key] || { start: "", end: "" }, session: "morning" });
        }
        for (let i = 1; i <= config.afternoonCount; i++) {
            let key = `C${i}`;
            list.push({ id: key, name: `T${list.length + 1}`, time: config.times[key] || { start: "", end: "" }, session: "afternoon" });
        }
        return list;
    }

    const classSelect = document.getElementById('classSelect');
    classSelect.addEventListener('change', (e) => {
        selectedClass = e.target.value;
        updatePresetDropdown();
    });

    const selectPresetSubject = document.getElementById('selectPresetSubject');
    selectPresetSubject.addEventListener('change', () => {
        let autoColor = getColorForSubject(selectPresetSubject.value);
        document.getElementById('inputCustomColor').value = autoColor;
        document.getElementById('colorPreview').style.backgroundColor = autoColor;
    });

    window.selectPresetColor = (hex) => {
        document.getElementById('inputCustomColor').value = hex;
        document.getElementById('colorPreview').style.backgroundColor = hex;
    };

    document.getElementById('inputCustomColor').addEventListener('input', (e) => {
        document.getElementById('colorPreview').style.backgroundColor = e.target.value;
    });

    function updatePresetDropdown() {
        const subjects = presetSubjects[selectedClass] || presetSubjects[1];
        selectPresetSubject.innerHTML = '';
        subjects.forEach(sub => {
            let opt = document.createElement('option');
            opt.value = sub.name;
            opt.textContent = sub.name;
            selectPresetSubject.appendChild(opt);
        });
        if (subjects.length > 0) {
            let c = getColorForSubject(subjects[0].name);
            document.getElementById('inputCustomColor').value = c;
            document.getElementById('colorPreview').style.backgroundColor = c;
        }
    }
    updatePresetDropdown();

    let scheduleData = JSON.parse(localStorage.getItem('my_tkb_data')) || {
        "2-S1": { name: "Toán", color: "#4f46e5", duration: 2 },
        "2-C1": { name: "Tiếng Việt", color: "#ea580c", duration: 1 }
    };

    function saveData() {
        localStorage.setItem('my_tkb_data', JSON.stringify(scheduleData));
    }

    function renderTable() {
        let headerHtml = `
            <th class="p-2 text-xs font-bold text-slate-400 uppercase w-10 text-center border-r">Buổi</th>
            <th class="p-3 text-xs font-bold text-slate-400 uppercase w-50 text-center">Tiết<br><span class="font-normal text-[10px]">Giờ</span></th>
        `;
        activeDays.forEach(day => {
            headerHtml += `<th class="p-3 text-xs font-bold text-slate-700 text-center">${dayNames[day].name}<br><span class="font-normal text-[10px] text-slate-400">${dayNames[day].short}</span></th>`;
        });
        document.getElementById('tableHeaderRow').innerHTML = headerHtml;

        let periodsList = getActivePeriodsList();
        let skippedCells = {};
        let tbody = document.getElementById('tkbBody');
        tbody.innerHTML = '';

        let mCount = config.morningCount;
        let aCount = config.afternoonCount;

        periodsList.forEach((p, index) => {
            let tr = document.createElement('tr');
            
            if (index === mCount && mCount > 0 && aCount > 0) {
                tr.classList.add('session-divider');
            }

            let html = '';
            if (index === 0 && mCount > 0) {
                html += `<td rowspan="${mCount}" class="p-0 text-center align-middle font-bold text-sm text-indigo-600 bg-indigo-50/40 border-r tracking-widest"><div class="vertical-text w-full h-full flex items-center justify-center m-auto">SÁNG</div></td>`;
            } else if (index === mCount && aCount > 0) {
                html += `<td rowspan="${aCount}" class="p-0 text-center align-middle font-bold text-sm text-orange-600 bg-orange-50/40 border-r tracking-widest"><div class="vertical-text w-full h-full flex items-center justify-center m-auto">CHIỀU</div></td>`;
            }

            let timeStr = p.time.start && p.time.end ? `${p.time.start} - ${p.time.end}` : '';
            html += `
                <td class="p-2 text-center align-middle bg-slate-50/50">
                    <div class="font-bold text-slate-900 text-sm">${p.name}</div>
                    <div class="text-[11px] text-slate-500 mt-0.5 font-medium whitespace-nowrap">${timeStr}</div>
                </td>
            `;

            activeDays.forEach(day => {
                let cellKey = `${day}-${p.id}`;
                if (skippedCells[cellKey]) return;

                let cellData = scheduleData[cellKey];
                if (cellData) {
                    let duration = cellData.duration || 1;
                    
                    let startTime = p.time.start;
                    let endTime = p.time.end;
                    if (duration > 1) {
                        let targetIdx = index + duration - 1;
                        if (targetIdx < periodsList.length) {
                            endTime = periodsList[targetIdx].time.end;
                        }
                    }

                    for (let i = 1; i < duration; i++) {
                        let nextP = periodsList[index + i];
                        if (nextP) skippedCells[`${day}-${nextP.id}`] = true;
                    }

                    let mainColor = cellData.color || getColorForSubject(cellData.name);
                    let rowspanAttr = duration > 1 ? `rowspan="${duration}"` : '';
                    let noteHtml = cellData.note ? `<div class="text-[11px] font-medium mt-1 opacity-80">${cellData.note}</div>` : '';

                    // Ô môn học: Tăng size tên môn lên text-sm và giờ học lên text-xs
                    html += `
                        <td class="p-1 align-middle text-center" ${rowspanAttr} style="width: ${100 / activeDays.length}%" data-day="${day}" data-period="${p.id}">
                            <div class="tkb-subject-cell p-2.5 rounded-xl border cursor-pointer hover:shadow-md transition flex flex-col justify-center items-center" 
                                 style="background-color: ${mainColor}15; border-color: ${mainColor}50; color: ${mainColor};"
                                 onclick="openEditModal('${day}', '${p.id}')">
                                <div class="font-bold text-sm">${cellData.name}</div>
                                ${noteHtml}
                                <div class="text-xs font-semibold opacity-90 mt-1">${startTime} - ${endTime}</div>
                            </div>
                        </td>
                    `;
                } else {
                    // Ô trống "+ Thêm": Tăng size chữ lên text-xs
                    html += `
                        <td class="p-1 align-middle text-center" style="width: ${100 / activeDays.length}%; height: 38px;" data-day="${day}" data-period="${p.id}">
                            <div class="tkb-empty-cell add-subject-cell w-full h-full rounded-lg border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition cursor-pointer flex items-center justify-center text-slate-500 hover:text-indigo-600 font-semibold text-xs" onclick="openEditModal('${day}', '${p.id}')">
                                <span class="add-subject-label">+ Thêm</span>
                            </div>
                        </td>
                    `;
                }
            });

            tr.innerHTML = html;
            tbody.appendChild(tr);
        });
    }

    document.querySelectorAll('.day-chip').forEach(btn => {
        const dayNum = parseInt(btn.getAttribute('data-day'));
        btn.addEventListener('click', function() {
            if (activeDays.includes(dayNum)) {
                let hasSubjects = false;
                let periodsList = getActivePeriodsList();
                periodsList.forEach(p => {
                    if (scheduleData[`${dayNum}-${p.id}`]) hasSubjects = true;
                });

                if (hasSubjects) {
                    showCustomAlert("Xác nhận xóa ngày", `Ngày ${dayNames[dayNum].name} có môn học. Bạn muốn xóa ngày này?`, "confirm", (confirmed) => {
                        if (confirmed) {
                            Object.keys(scheduleData).forEach(k => { if (k.startsWith(`${dayNum}-`)) delete scheduleData[k]; });
                            saveData();
                            if (activeDays.length === 1) { showCustomAlert("Thông báo", "Cần giữ lại ít nhất 1 ngày!"); return; }
                            activeDays = activeDays.filter(d => d !== dayNum);
                            btn.classList.remove('active');
                            renderTable();
                        }
                    });
                    return;
                }
                if (activeDays.length === 1) { showCustomAlert("Thông báo", "Cần giữ lại ít nhất 1 ngày!"); return; }
                activeDays = activeDays.filter(d => d !== dayNum);
                btn.classList.remove('active');
                renderTable();
            } else {
                activeDays.push(dayNum);
                activeDays.sort((a, b) => a - b);
                btn.classList.add('active');
                renderTable();
            }
        });
    });

    renderTable();

    const modal = document.getElementById('subjectModal');
    let activeDay = null;
    let activePeriodId = null;

    window.openEditModal = function(day, periodId) {
        activeDay = day;
        activePeriodId = periodId;
        let key = `${day}-${periodId}`;
        let existing = scheduleData[key];
        let periodsList = getActivePeriodsList();
        let clickedIndex = periodsList.findIndex(p => p.id === periodId);
        let inputStart = document.getElementById('inputStart');
        inputStart.max = periodsList.length;
        inputStart.value = clickedIndex >= 0 ? clickedIndex + 1 : 1;

        document.getElementById('modalTitle').innerText = existing ? `Chỉnh sửa môn học` : `Thêm môn học`;
        document.getElementById('inputDuration').value = existing ? existing.duration : 1;
        document.getElementById('inputSubjectNote').value = existing ? (existing.note || '') : '';

        if (existing) {
            document.getElementById('deleteSubjectBtn').classList.remove('hidden');
            let subjects = presetSubjects[selectedClass] || [];
            let found = subjects.find(s => s.name === existing.name);
            if (found) {
                document.getElementById('tabPredefined').click();
                selectPresetSubject.value = existing.name;
            } else {
                document.getElementById('tabCustom').click();
                document.getElementById('inputSubjectName').value = existing.name;
            }
            let c = existing.color || getColorForSubject(existing.name);
            document.getElementById('inputCustomColor').value = c;
            document.getElementById('colorPreview').style.backgroundColor = c;
        } else {
            document.getElementById('deleteSubjectBtn').classList.add('hidden');
            document.getElementById('tabPredefined').click();
            document.getElementById('inputSubjectName').value = '';
            let subjects = presetSubjects[selectedClass] || [];
            if (subjects.length > 0) {
                let c = getColorForSubject(subjects[0].name);
                document.getElementById('inputCustomColor').value = c;
                document.getElementById('colorPreview').style.backgroundColor = c;
            }
        }
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    };

    document.getElementById('closeModalBtn').onclick = () => { modal.classList.remove('flex'); modal.classList.add('hidden'); };
    
    document.getElementById('tabPredefined').onclick = function() {
        this.className = "flex-1 py-2 text-xs font-bold rounded-xl bg-white text-indigo-600 shadow-sm transition";
        document.getElementById('tabCustom').className = "flex-1 py-2 text-xs font-bold rounded-xl text-slate-500 transition";
        document.getElementById('predefinedSection').classList.remove('hidden');
        document.getElementById('customSection').classList.add('hidden');
    };
    document.getElementById('tabCustom').onclick = function() {
        this.className = "flex-1 py-2 text-xs font-bold rounded-xl bg-white text-indigo-600 shadow-sm transition";
        document.getElementById('tabPredefined').className = "flex-1 py-2 text-xs font-bold rounded-xl text-slate-500 transition";
        document.getElementById('customSection').classList.remove('hidden');
        document.getElementById('predefinedSection').classList.add('hidden');
    };

    document.getElementById('deleteSubjectBtn').onclick = () => {
        showCustomAlert("Xác nhận", "Xóa môn học này?", "confirm", (confirmed) => {
            if (confirmed) {
                delete scheduleData[`${activeDay}-${activePeriodId}`];
                saveData();
                modal.classList.remove('flex');
                modal.classList.add('hidden');
                renderTable();
            }
        });
    };

    document.getElementById('modalForm').onsubmit = (e) => {
        e.preventDefault();
        let isPreset = !document.getElementById('predefinedSection').classList.contains('hidden');
        let name = isPreset ? selectPresetSubject.value : document.getElementById('inputSubjectName').value;
        let color = document.getElementById('inputCustomColor').value;
        let note = document.getElementById('inputSubjectNote').value.trim();
        let duration = parseInt(document.getElementById('inputDuration').value) || 1;
        let startNumber = parseInt(document.getElementById('inputStart').value);

        let periodsList = getActivePeriodsList();
        let startIndex = startNumber - 1;
        if (startIndex < 0 || startIndex >= periodsList.length) {
            showCustomAlert("Lỗi", "Tiết bắt đầu không hợp lệ!");
            return;
        }

        let startPeriod = periodsList[startIndex];
        for (let i = 0; i < duration; i++) {
            let targetP = periodsList[startIndex + i];
            if (!targetP) { showCustomAlert("Lỗi", "Vượt quá số tiết trong ngày!"); return; }
            if (targetP.session !== startPeriod.session) {
                showCustomAlert("Không thể kéo dài môn học", "Môn học không được kéo dài từ buổi sáng sang buổi chiều. Vui lòng thêm môn đó vào buổi chiều riêng.");
                return;
            }
            let targetKey = `${activeDay}-${targetP.id}`;
            if (scheduleData[targetKey] && targetKey !== `${activeDay}-${activePeriodId}`) {
                showCustomAlert("Trùng lịch", `Trùng với môn khác ở tiết ${targetP.id}!`);
                return;
            }
        }

        let oldKey = `${activeDay}-${activePeriodId}`;
        let newKey = `${activeDay}-${periodsList[startIndex].id}`;
        delete scheduleData[oldKey];
        scheduleData[newKey] = { name, color, duration, note };
        saveData();
        modal.classList.remove('flex');
        modal.classList.add('hidden');
        renderTable();
    };

    document.getElementById('exportBtn').onclick = () => {
        const captureArea = document.getElementById('captureArea');
        const previousTitleButtonDisplay = editTitleBtn.style.display;
        const captureRect = captureArea.getBoundingClientRect();
        const captureWidth = Math.ceil(captureRect.width);
        const captureHeight = Math.ceil(captureRect.height);
        editTitleBtn.style.display = 'none';

        htmlToImage.toPng(captureArea, {
            backgroundColor: '#ffffff',
            pixelRatio: 2,
            cacheBust: false,
            width: captureWidth,
            height: captureHeight,
            style: {
                position: 'relative',
                transform: 'none',
                top: 'auto',
                left: 'auto',
                margin: '0',
                boxSizing: 'border-box',
                width: `${captureWidth}px`,
                height: `${captureHeight}px`
            }
        }).then(dataUrl => {
            const link = document.createElement('a');
            link.download = 'thoi-khoa-bieu.png';
            link.href = dataUrl;
            link.click();
        }).catch(() => {
            showCustomAlert("Lỗi", "Không thể xuất ảnh thời khóa biểu. Vui lòng thử lại.");
        }).finally(() => {
            editTitleBtn.style.display = previousTitleButtonDisplay;
        });
    };
});