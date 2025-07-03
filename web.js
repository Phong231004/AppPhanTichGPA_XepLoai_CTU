document.getElementById("featureSelect").addEventListener("change", function () {
    const value = this.value;
    document.getElementById("formContainer").innerHTML = "";
    document.getElementById("resultContainer").innerHTML = "";
    if (value === "gpa") renderGPAForm();
    if (value === "estimate") renderEstimateForm();
    if (value === "rank") renderRankForm();
  });
  
  function renderGPAForm() {
    const formContainer = document.getElementById("formContainer");
    formContainer.innerHTML = `
      <div class="mb-3">
        <label for="subjectCount">Tổng số môn học:</label>
        <input type="number" id="subjectCount" class="form-control" min="1">
        <button class="btn btn-primary mt-2" onclick="renderSubjectInputs()">Tiếp theo</button>
      </div>
      <div id="subjectInputs"></div>
    `;
  }
  
  function renderSubjectInputs() {
    const count = parseInt(document.getElementById("subjectCount").value);
    const container = document.getElementById("subjectInputs");
    let html = "";
    for (let i = 1; i <= count; i++) {
        html += `
        <div class="mb-2 row">
          <div class="col">
            <input type="text" class="form-control" 
                   placeholder="Điểm môn ${i} (0 - 10)" 
                   id="score${i}" 
                   oninput="this.value = this.value.replace(/[^\\d.]/g, '').replace(/(\\..*)\\./g, '$1'); 
                             if (parseFloat(this.value) > 10) this.value = 10;" 
                   required>
          </div>
          <div class="col">
            <input type="text" class="form-control" 
                   placeholder="Số tín chỉ môn ${i}" 
                   id="credit${i}" 
                   oninput="this.value = this.value.replace(/[^\\d]/g, '').replace(/^0+/, ''); 
                             if (parseInt(this.value) > 99) this.value = 99;" 
                   required>
          </div>
        </div>`;      
    }
    html += `<button class="btn btn-success mt-2" onclick="calculateGPA(${count})">Tính GPA</button>`;
    container.innerHTML = html;
  }
  
// Hàm tính GPA dựa trên điểm số và tín chỉ
function calculateGPA(count) {
    const gradeMap = [
      { min: 9, letter: "A", gpa: 4.0 },
      { min: 8, letter: "B+", gpa: 3.5 },
      { min: 7, letter: "B", gpa: 3.0 },
      { min: 6.5, letter: "C+", gpa: 2.5 },
      { min: 5.5, letter: "C", gpa: 2.0 },
      { min: 5.0, letter: "D+", gpa: 1.5 },
      { min: 4.0, letter: "D", gpa: 1.0 },
      { min: 0, letter: "F", gpa: 0.0 }
    ];
  
    let total = 0;
    let credits = 0;
    let calcDetails = ""; // chi tiết tính toán từng môn
  
    calcDetails += "<h5>Chi tiết từng môn:</h5>";
    calcDetails += `<table class="table table-bordered table-striped">
        <thead>
          <tr>
            <th>Môn</th>
            <th>Điểm (hệ 10)</th>
            <th>Điểm chữ</th>
            <th>GPA (hệ 4.0)</th>
            <th>Tín chỉ</th>
          </tr>
        </thead>
        <tbody>`;
  
    for (let i = 1; i <= count; i++) {
      const score = parseFloat(document.getElementById(`score${i}`).value);
      const credit = parseInt(document.getElementById(`credit${i}`).value);
      const grade = gradeMap.find(g => score >= g.min);
  
      const product = grade.gpa * credit;
      const showProduct = (grade.letter !== "F") ? product.toFixed(2) : "-";
  
      calcDetails += `<tr>
          <td>Môn ${i}</td>
          <td>${score}</td>
          <td>${grade.letter}</td>
          <td>${grade.gpa}</td>
          <td>${credit}</td>
        </tr>`;
  
      if (grade.letter !== "F") {
        total += product;
        credits += credit;
      }
    }
  
    const gpa = (total / credits).toFixed(2);
  
    calcDetails += `</tbody></table>`;
    calcDetails += `
      <p><strong>Tổng (GPA × Tín chỉ):</strong> ${total.toFixed(2)}</p>
      <p><strong>Tổng tín chỉ:</strong> ${credits}</p>
      <div class="card mt-3 border-success">
        <div class="card-body text-success fw-bold">
            GPA học kỳ: ${gpa}
            </div>
        </div>
      `;
  
    // Hiển thị công thức tính GPA bằng MathJax
    const formula = `
      <div class="mt-3">
        <h6>Công thức tính GPA:</h6>
        <p>$$ \\text{GPA} = \\frac{\\sum (\\text{Điểm hệ số 4} \\times \\text{Tín chỉ})}{\\sum \\text{Tín chỉ}} $$</p>
        <p><em>Lưu ý</em>: Môn bị điểm <strong>F</strong> không được tính vào tổng tín chỉ.</p>
      </div>
    `;
  
    document.getElementById("resultContainer").innerHTML = calcDetails + formula;
  
    if (window.MathJax) {
      MathJax.typeset();
    }
  }
  
  
  function renderEstimateForm() {
    document.getElementById("formContainer").innerHTML = `
      <div class="mb-2">
        GPA hiện tại: <input type="number" id="currentGPA" class="form-control" step="0.01" min="0" max="4">
      </div>
      <div class="mb-2">
        Tín chỉ hiện tại: <input type="number" id="currentCredit" class="form-control" min="0">
      </div>
      <div class="mb-2">
        Tổng tín chỉ ngành: <input type="number" id="totalCredit" class="form-control" min="0">
      </div>
      <div class="mb-2">
        GPA kỳ vọng tốt nghiệp: <input type="number" id="targetGPA" class="form-control" step="0.01" min="0" max="4">
      </div>
      <button class="btn btn-success" onclick="estimateGraduation()">Ước lượng</button>
    `;
  }
  
  function estimateGraduation() {
    const currentGPA = parseFloat(document.getElementById("currentGPA").value);
    const currentCredit = parseInt(document.getElementById("currentCredit").value);
    const totalCredit = parseInt(document.getElementById("totalCredit").value);
    const targetGPA = parseFloat(document.getElementById("targetGPA").value);
  
    const remainCredit = totalCredit - currentCredit;
    const totalRequiredGPA = targetGPA * totalCredit;
    const requiredGPA = ((totalRequiredGPA - currentGPA * currentCredit) / remainCredit).toFixed(2);
  
    let output = "";
  
    // Nếu yêu cầu GPA > 4 thì cảnh báo
    if (requiredGPA > 4) {
      output += `
        <div class="alert alert-danger fw-bold">
          GPA cần đạt: ${requiredGPA} / 4.0 – Không khả thi!<br>
          ⚠️ Hãy xem xét cải thiện GPA hiện tại hoặc điều chỉnh kỳ vọng tốt nghiệp.
        </div>
      `;
    } else {
      output += `
        <div class="alert alert-success fw-bold">
          GPA cần đạt cho ${remainCredit} tín chỉ còn lại: ${requiredGPA}
        </div>
      `;
  
      // Gợi ý phân phối điểm chữ theo GPA trung bình
      const estimateTable = `
        <div class="mt-3">
          <h6>Gợi ý phân phối điểm (để đạt GPA trung bình ${requiredGPA}):</h6>
          <table class="table table-bordered text-center">
            <thead class="table-light">
              <tr>
                <th>Điểm chữ</th>
                <th>GPA</th>
                <th>Số môn (3 tín chỉ)</th>
              </tr>
            </thead>
            <tbody>
              ${generateEstimate(requiredGPA, remainCredit)}
            </tbody>
          </table>
          <p><small>Ước tính dựa trên mỗi môn 3 tín chỉ. Thay đổi theo thực tế.</small></p>
        </div>
      `;
  
      output += estimateTable;
    }
  
    document.getElementById("resultContainer").innerHTML = output;
  }
  function generateEstimate(requiredGPA, remainCredit) {
    const creditPerSubject = 3;
    const totalSubjects = Math.round(remainCredit / creditPerSubject);
  
    const gradeMap = [
      { letter: "A", gpa: 4.0 },
      { letter: "B+", gpa: 3.5 },
      { letter: "B", gpa: 3.0 },
      { letter: "C+", gpa: 2.5 },
      { letter: "C", gpa: 2.0 }
    ];
  
    let bestCombo = null;
    let bestGPA = 0;
  
    // Backtrack để tìm tổ hợp tổng = totalSubjects
    function backtrack(index, counts, total, sumGPA) {
      if (total > totalSubjects || index === gradeMap.length) return;
  
      if (total === totalSubjects) {
        const avgGPA = sumGPA / totalSubjects;
        if (avgGPA >= requiredGPA && (!bestCombo || Math.abs(avgGPA - requiredGPA) < Math.abs(bestGPA - requiredGPA))) {
          bestCombo = [...counts];
          bestGPA = avgGPA;
        }
        return;
      }
  
      for (let i = 0; i <= totalSubjects; i++) {
        counts[index] = i;
        backtrack(index + 1, counts, total + i, sumGPA + i * gradeMap[index].gpa);
        counts[index] = 0;
      }
    }
  
    backtrack(0, new Array(gradeMap.length).fill(0), 0, 0);
  
    if (!bestCombo) {
      return `<tr><td colspan="3" class="text-danger">Không thể phân phối phù hợp với GPA ${requiredGPA}.</td></tr>`;
    }
  
    let rows = "";
    for (let i = 0; i < gradeMap.length; i++) {
      if (bestCombo[i] > 0) {
        rows += `
          <tr>
            <td>${gradeMap[i].letter}</td>
            <td>${gradeMap[i].gpa}</td>
            <td>${bestCombo[i]}</td>
          </tr>
        `;
      }
    }
  
    rows += `
      <tr class="table-success fw-bold">
        <td colspan="2">GPA trung bình</td>
        <td>${bestGPA.toFixed(2)}</td>
      </tr>
    `;
  
    return rows;
  }
    
  
  function renderRankForm() {
    document.getElementById("formContainer").innerHTML = `
      <div class="mb-3">
        <label for="fileInput">Upload file Excel:</label>
        <input type="file" class="form-control" id="fileInput" accept=".xlsx, .xls">
      </div>
      <button class="btn btn-primary" onclick="processRanking()">Xử lý xếp hạng</button>
    `;
  }
  
  function processRanking() {
    const file = document.getElementById("fileInput").files[0];
    if (!file) return alert("Hãy chọn file Excel");
  
    const reader = new FileReader();
    reader.onload = function (e) {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet);
  
      rows.forEach(row => {
        const gpa = parseFloat(row["GPA học kỳ"]);
        const drl = parseFloat(row["Điểm rèn luyện"]);
  
        let gpaRank = "", drlRank = "";
        if (gpa >= 3.6) gpaRank = "Xuất sắc";
        else if (gpa >= 3.2) gpaRank = "Giỏi";
        else if (gpa >= 2.5) gpaRank = "Khá";
        else if (gpa >= 2.0) gpaRank = "Trung bình";
        else if (gpa >= 1.0) gpaRank = "Yếu";
        else gpaRank = "Không xét";
  
        if (drl >= 90) drlRank = "Xuất sắc";
        else if (drl >= 80) drlRank = "Giỏi";
        else if (drl >= 70) drlRank = "Khá";
        else if (drl >= 60) drlRank = "Trung bình";
        else if (drl >= 50) drlRank = "Yếu";
        else drlRank = "Không xét";
  
        const typeList = ["Không xét", "Yếu", "Trung bình", "Khá", "Giỏi", "Xuất sắc"];
        row["Xếp loại"] = typeList[Math.min(typeList.indexOf(gpaRank), typeList.indexOf(drlRank))];
      });
  
      rows.sort((a, b) => {
        const typeList = ["Không xét", "Yếu", "Trung bình", "Khá", "Giỏi", "Xuất sắc"];
        const ra = typeList.indexOf(a["Xếp loại"]);
        const rb = typeList.indexOf(b["Xếp loại"]);
        if (ra !== rb) return rb - ra;
        if (a["GPA học kỳ"] !== b["GPA học kỳ"]) return b["GPA học kỳ"] - a["GPA học kỳ"];
        if (a["Điểm rèn luyện"] !== b["Điểm rèn luyện"]) return b["Điểm rèn luyện"] - a["Điểm rèn luyện"];
        return b["Số tín chỉ đăng ký"] - a["Số tín chỉ đăng ký"];
      });
  
      let html = `<table class="table table-bordered table-hover mt-3">
        <thead><tr>`;
      Object.keys(rows[0]).forEach(k => html += `<th>${k}</th>`);
      html += `</tr></thead><tbody>`;
      rows.forEach(row => {
        html += `<tr>`;
        Object.values(row).forEach(cell => html += `<td>${cell}</td>`);
        html += `</tr>`;
      });
      html += `</tbody></table>`;
      document.getElementById("resultContainer").innerHTML = html;
    };
    reader.readAsArrayBuffer(file);
  }
  