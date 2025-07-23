const studentForm = document.getElementById('studentForm');
const studentTable = document.getElementById('studentTable').getElementsByTagName('tbody')[0];
const selectBtn = document.getElementById('selectBtn');
const updateBtn = document.getElementById('updateBtn');
const deleteBtn = document.getElementById('deleteBtn');
const dashboard = document.getElementById('dashboard');
const searchInput = document.getElementById('searchInput');
const filterAttendance = document.getElementById('filterAttendance');
const sortBySelect = document.getElementById('sortBySelect');
let selectedRow = null;
let studentsData = [];
let hasSorted = false;

function updateLastUpdated() {
    const lastUpdatedDiv = document.getElementById('lastUpdated');
    const now = new Date();
    const formatted = now.toLocaleString(); // e.g., "4/14/2025, 10:33:15 AM"
    lastUpdatedDiv.textContent = `Last updated: ${formatted}`;
  }
  

function saveToLocalStorage() {
    localStorage.setItem('students', JSON.stringify(studentsData));
  }
  

function applyRowStyles(row, student) {
  row.classList.remove('warning', 'top-performer');

  if (student.marks < 40 || student.attendance < 40) {
    row.classList.add('warning');
  } else if (student.marks > 90) {
    row.classList.add('top-performer');
  }
}

studentForm.addEventListener('submit', function (e) {
  e.preventDefault();
  addOrUpdateRow();
});

function addOrUpdateRow(isUpdate = false) {
  const name = document.getElementById('studentName').value;
  const roll = document.getElementById('rollNumber').value;
  const course = document.getElementById('course').value;
  const marks = parseFloat(document.getElementById('marks').value);
  const attendance = parseFloat(document.getElementById('attendance').value);
  const feePaymentStatus = document.getElementById('feePaymentStatus').value;

  let student = { name, roll, course, marks, attendance, feePaymentStatus };

  if (isUpdate && selectedRow) {
    selectedRow.innerHTML = `
      <td>${roll}</td>
      <td>${name}</td>
      <td>${course}</td>
      <td>${marks}%</td>
      <td>${attendance}%</td>
      <td>${feePaymentStatus}</td>
    `;
    studentsData[selectedRow.rowIndex - 1] = student;
    applyRowStyles(selectedRow, student);
  } else {
    const row = studentTable.insertRow();
    row.innerHTML = `
      <td>${roll}</td>
      <td>${name}</td>
      <td>${course}</td>
      <td>${marks}%</td>
      <td>${attendance}%</td>
      <td>${feePaymentStatus}</td>
    `;
    row.onclick = function () {
      if (selectedRow === row) {
        row.classList.remove('selected');
        selectedRow = null;
      } else {
        if (selectedRow) selectedRow.classList.remove('selected');
        selectedRow = row;
        row.classList.add('selected');
      }
    };
    applyRowStyles(row, student);
    studentsData.push(student);
  }
  saveToLocalStorage();

  studentForm.reset();
  updateDashboard();
  if (hasSorted) filterAndSortData();
  updateLastUpdated();
}

selectBtn.addEventListener('click', function () {
  if (selectedRow) {
    document.getElementById('rollNumber').value = selectedRow.cells[0].textContent;
    document.getElementById('studentName').value = selectedRow.cells[1].textContent;
    document.getElementById('course').value = selectedRow.cells[2].textContent;
    document.getElementById('marks').value = selectedRow.cells[3].textContent.replace('%', '');
    document.getElementById('attendance').value = selectedRow.cells[4].textContent.replace('%', '');
    document.getElementById('feePaymentStatus').value = selectedRow.cells[5].textContent;
  } else {
    alert("Please select a student row first.");
  }
});

updateBtn.addEventListener('click', function () {
    if (selectedRow) {
      const selectedRoll = selectedRow.cells[0].textContent;
  
      // Gather updated input values
      const name = document.getElementById('studentName').value;
      const roll = document.getElementById('rollNumber').value;
      const course = document.getElementById('course').value;
      const marks = parseFloat(document.getElementById('marks').value);
      const attendance = parseFloat(document.getElementById('attendance').value);
      const feePaymentStatus = document.getElementById('feePaymentStatus').value;
  
      const updatedStudent = { name, roll, course, marks, attendance, feePaymentStatus };
  
      // Update the correct student in studentsData using roll number
      const index = studentsData.findIndex(s => s.roll === selectedRoll);
      if (index !== -1) {
        studentsData[index] = updatedStudent;
      }
  
      // Refresh table
      if (hasSorted) {
        filterAndSortData();
      } else {
        renderTable(studentsData);
      }
  
      selectedRow = null;
      studentForm.reset();
      saveToLocalStorage();
      updateDashboard();
      updateLastUpdated();
  
    } else {
      alert("Please select a student row to update.");
    }
  });
  

deleteBtn.addEventListener('click', function () {
    if (selectedRow) {
      const selectedRoll = selectedRow.cells[0].textContent;
  
      // Delete row from HTML table
      studentTable.deleteRow(selectedRow.rowIndex - 1);
  
      // Remove student from studentsData using roll number
      studentsData = studentsData.filter(student => student.roll !== selectedRoll);
  
      selectedRow = null;
      saveToLocalStorage();
      studentForm.reset();
      updateDashboard();
  
      if (hasSorted) {
        filterAndSortData();
      } else {
        renderTable(studentsData); // Refresh the table with original data
      }
  
      updateLastUpdated();
    } else {
      alert("Please select a student row to delete.");
    }
  });
  

function updateDashboard() {
  const totalStudents = studentsData.length;
  const attendances = studentsData.map(student => student.attendance);
  const minAtt = attendances.length ? Math.min(...attendances).toFixed(2) : 0;
  const maxAtt = attendances.length ? Math.max(...attendances).toFixed(2) : 0;

  dashboard.innerHTML = `
    <span>Total Students: ${totalStudents}</span>
    <span>Lowest Attendance: ${minAtt}%</span>
    <span>Highest Attendance: ${maxAtt}%</span>
  `;
}

function filterAndSortData() {
  hasSorted = true;
  const searchTerm = searchInput.value.toLowerCase();
  const filteredData = studentsData.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm) ||
      student.course.toLowerCase().includes(searchTerm) ||
      student.roll.toLowerCase().includes(searchTerm);
    const matchesAttendance = filterAttendance.value === 'all' || student.attendance < 50;
    return matchesSearch && matchesAttendance;
  });

  const sortedData = filteredData.sort((a, b) => {
    if (sortBySelect.value === 'marks') {
      return b.marks - a.marks;
    } else if (sortBySelect.value === 'attendance') {
      return b.attendance - a.attendance;
    } else if (sortBySelect.value === 'roll') {
      // Sort by Roll Number (assumes numeric, but handles string too)
      return a.roll.localeCompare(b.roll, undefined, { numeric: true, sensitivity: 'base' });
    }
    return 0;
  });
  

  renderTable(sortedData);
}

function renderTable(data) {
  studentTable.innerHTML = '';
  data.forEach(student => {
    const row = studentTable.insertRow();
    row.innerHTML = `
      <td>${student.roll}</td>
      <td>${student.name}</td>
      <td>${student.course}</td>
      <td>${student.marks}%</td>
      <td>${student.attendance}%</td>
      <td>${student.feePaymentStatus}</td>
    `;
    row.onclick = function () {
      if (selectedRow === row) {
        row.classList.remove('selected');
        selectedRow = null;
      } else {
        if (selectedRow) selectedRow.classList.remove('selected');
        selectedRow = row;
        row.classList.add('selected');
      }
    };
    applyRowStyles(row, student);
  });
}

// Only enable filtering/sorting after user interacts
searchInput.addEventListener('input', filterAndSortData);
filterAttendance.addEventListener('change', filterAndSortData);
sortBySelect.addEventListener('change', filterAndSortData);


window.addEventListener('DOMContentLoaded', () => {
    const storedData = localStorage.getItem('students');
    if (storedData) {
      studentsData = JSON.parse(storedData);
      renderTable(studentsData);
      updateDashboard();
    }
  });
  

  // Assuming you have a canvas with id="studentChart" in your HTML

function showDoubleBarChart() {
    // If chart already exists, destroy it
    if (window.myChart) window.myChart.destroy();
  
    const names = studentsData.map(s => s.name);
    const marks = studentsData.map(s => s.marks);
    const attendance = studentsData.map(s => s.attendance);
  
    const ctx = document.getElementById('studentChart').getContext('2d');
  
    window.myChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: names,
        datasets: [
          {
            label: 'Marks (%)',
            data: marks,
            backgroundColor: '#5c7ce3',
          },
          {
            label: 'Attendance (%)',
            data: attendance,
            backgroundColor: '#48c78e',
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            stacked: false
          },
          y: {
            beginAtZero: true,
            max: 100
          }
        }
      }
    });
  }
  

  function toggleChart() {
    const chartContainer = document.getElementById('chartContainer');
  
    if (chartContainer.style.display === 'none') {
      chartContainer.style.display = 'block';
      showDoubleBarChart(); // call your chart render function
    } else {
      chartContainer.style.display = 'none';
      if (window.myChart) {
        window.myChart.destroy(); // destroy the chart instance to avoid duplicates
        window.myChart = null;
      }
    }
  }
  
  
  function detectRisk() {
    if (studentsData.length === 0) {
      alert("No student data available for risk detection.");
      return;
    }
  
    // Simple classification: mark students at risk
    const riskyStudents = studentsData.filter(student => {
      return student.marks < 40 || student.attendance < 40 || student.feePaymentStatus === "Unpaid";
    });
  
    if (riskyStudents.length === 0) {
      document.getElementById('aiOutput').innerHTML = "✅ No students are at risk!";
    } else {
      const risks = riskyStudents.map(student =>
        `⚠️ ${student.name} (${student.roll}) is at risk`
      );
      document.getElementById('aiOutput').innerHTML = risks.join('<br>');
    }
  }
  
  async function getRecommendations() {
    const topic = document.getElementById('topicInput').value.trim();
    if (!topic) {
        alert("Please enter a subject or topic.");
        return;
    }

    // Clear previous recommendations
    document.getElementById('youtubeLinks').innerHTML = '';
    document.getElementById('websiteLinks').innerHTML = '';

    // Fetch YouTube videos related to the topic
    const youtubeLinks = await fetchYouTubeVideos(topic);
    displayRecommendations(youtubeLinks, 'youtubeLinks');

    // Fetch websites using a search API
    const websiteLinks = await fetchWebsiteLinks(topic);
    displayRecommendations(websiteLinks, 'websiteLinks');
}

async function fetchYouTubeVideos(topic) {
    const apiKey = 'AIzaSyCKA8A8sXsKYEcD2vXEMUQAKT4UKn6F4UE'; // Add your YouTube Data API key here
    const maxResults = 5;
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${topic}&maxResults=${maxResults}&key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        const videos = data.items.map(item => {
            return {
                title: item.snippet.title,
                url: `https://www.youtube.com/watch?v=${item.id.videoId}`
            };
        });
        return videos;
    } catch (error) {
        console.error("Error fetching YouTube videos:", error);
        return [];
    }
}

async function fetchWebsiteLinks(topic) {
    const apiKey = 'AIzaSyB2mP9Vahgxcpbw1kKxYkZnnNQJZhNekvU'; // Add your Google Custom Search API key here
    const cx = '65403afbc86ee4d24'; // Add your Custom Search Engine ID here
    const url = `https://www.googleapis.com/customsearch/v1?q=${topic}&key=${apiKey}&cx=${cx}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        const websites = data.items.map(item => {
            return {
                title: item.title,
                link: item.link
            };
        });
        return websites;
    } catch (error) {
        console.error("Error fetching website links:", error);
        return [];
    }
}

function displayRecommendations(links, listId) {
    const listElement = document.getElementById(listId);
    links.forEach(link => {
        const listItem = document.createElement('li');
        const anchor = document.createElement('a');
        anchor.href = link.url || link.link;
        anchor.textContent = link.title;
        anchor.target = "_blank";
        listItem.appendChild(anchor);
        listElement.appendChild(listItem);
    });
}



function predictPerformance() {
  if (studentsData.length === 0) {
    alert("No student data available for prediction.");
    return;
  }

  // Add Final Term Marks column header if not already added
  const headerRow = document.querySelector('#studentTable thead tr');
  const existingHeader = Array.from(headerRow.cells).some(cell => cell.textContent === "Final Term Marks");
  if (!existingHeader) {
    const newHeaderCell = document.createElement('th');
    newHeaderCell.textContent = "Final Term Marks";
    headerRow.appendChild(newHeaderCell);
  }

  // Calculate predicted marks
  const coeff = 0.9;
  const bias = 5;

  // Add predicted marks to each table row
  const tbodyRows = document.querySelectorAll('#studentTable tbody tr');
  tbodyRows.forEach((row, index) => {
    const student = studentsData[index];
    const predicted = (student.attendance * coeff + bias).toFixed(2);

    // Remove existing prediction cell if already exists
    if (row.cells.length > 6) {
      row.deleteCell(-1);
    }

    const newCell = row.insertCell(-1);
    newCell.textContent = `${predicted}%`;
  });
}

  