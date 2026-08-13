// ==========================================================================
// Sigortak Web UI Controller
// ==========================================================================

const API_VEHICLE_URL = "http://localhost:5002/api/v1/vehicles";
const API_LOGIN_URL = "http://localhost:5001/api/v1/Auth/login";

let vehicles = [];

document.addEventListener("DOMContentLoaded", () => {
    // Kurları çek
    fetchExchangeRates();

    // 1. Çarpışma anı patlama efekti (1.1. saniyede)
    setTimeout(() => {
        const burst = document.querySelector(".burst-effect");
        if (burst) burst.classList.remove("hidden");
    }, 1100);

    // Splash ekranından geçiş (3.2. saniyede)
    setTimeout(() => {
        const splash = document.getElementById("splashScreen");
        if (splash) splash.classList.add("hidden");
        
        // Token kontrolü yap
        checkAuth();
    }, 3200);

    // Filtreleme Dinleyicileri
    document.getElementById("vehicleFilterInput").addEventListener("input", filterVehicles);
    document.getElementById("globalSearchInput").addEventListener("input", filterVehiclesGlobal);
});

// Oturum/Token Kontrolü
function checkAuth() {
    const token = localStorage.getItem("accessToken");
    if (token) {
        // Token varsa direkt Panele geç
        showAppPanel();
    } else {
        // Yoksa Giriş Ekranını aç
        showLoginPage();
    }
}

function showLoginPage() {
    document.getElementById("loginPage").classList.remove("hidden");
    document.getElementById("appContainer").classList.add("hidden");
}

function showAppPanel() {
    document.getElementById("loginPage").classList.add("hidden");
    document.getElementById("appContainer").classList.remove("hidden");
    fetchVehicles();
}

// 2. Giriş Yap (Identity API)
async function handleLogin(e) {
    e.preventDefault();
    const usernameInput = document.getElementById("loginUsername").value.trim();
    const passwordInput = document.getElementById("loginPassword").value.trim();
    const errorBox = document.getElementById("loginError");
    
    errorBox.classList.add("hidden");
    errorBox.innerText = "";

    try {
        const response = await fetch(API_LOGIN_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: usernameInput,
                password: passwordInput
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Giriş başarısız. Kullanıcı adı veya şifre hatalı.");
        }

        // Token'ları kaydet
        localStorage.setItem("accessToken", result.data.accessToken);
        localStorage.setItem("refreshToken", result.data.refreshToken);
        
        // Paneli Göster
        showAppPanel();
    } catch (error) {
        console.error("Giriş hatası:", error);
        errorBox.innerText = error.message || "Servis bağlantı hatası.";
        errorBox.classList.remove("hidden");
    }
}

// 3. Çıkış Yap
function handleLogout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    showLoginPage();
}

// 4. Araç Listesini Çek (Authorized)
async function fetchVehicles() {
    const tableBody = document.getElementById("vehiclesTableBody");
    const token = localStorage.getItem("accessToken");
    
    try {
        const response = await fetch(API_VEHICLE_URL, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                // Token süresi geçmişse çıkış yap
                handleLogout();
                return;
            }
            throw new Error("API Connection error");
        }
        
        const result = await response.json();
        vehicles = result.data || [];
        
        renderVehicles(vehicles);
    } catch (error) {
        console.error("Araç yüklenemedi:", error);
        tableBody.innerHTML = `
            <tr class="error-row">
                <td colspan="7" style="color: #991b1b; text-align: center; padding: 30px;">
                    <i class="fa-solid fa-triangle-exclamation"></i> API bağlantısı kurulamadı. Lütfen servislerin çalıştığından emin olun.
                </td>
            </tr>`;
    }
}

// 5. Tabloyu Doldur (HTML Render)
function renderVehicles(data) {
    const tableBody = document.getElementById("vehiclesTableBody");
    tableBody.innerHTML = "";
    
    if (data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #64748b;">Kayıtlı araç bulunamadı.</td></tr>`;
        return;
    }

    data.forEach(v => {
        const row = document.createElement("tr");
        
        // Muayene Kalan Gün & Badge
        const remDays = v.inspectionRemainingDays !== null ? v.inspectionRemainingDays : "-";
        let statusClass = "status-belirsiz";
        if (v.inspectionStatus === "MUAYENE DOLDU") statusClass = "status-doldu";
        else if (v.inspectionStatus === "MUAYENE DOLMAK ÜZERE") statusClass = "status-dolmak-uzere";
        else if (v.inspectionStatus === "ZAMANIN VAR") statusClass = "status-zamanin-var";

        // Sigorta Kalan Gün & Badge
        let insStatusClass = "status-belirsiz";
        if (v.insuranceStatus === "SİGORTA DOLDU") insStatusClass = "status-doldu";
        else if (v.insuranceStatus === "SİGORTA DOLMAK ÜZERE") insStatusClass = "status-dolmak-uzere";
        else if (v.insuranceStatus === "ZAMANIN VAR") insStatusClass = "status-zamanin-var";

        row.innerHTML = `
            <td><span class="plate-badge">${v.plate}</span></td>
            <td>
                <div class="vehicle-info">
                    <span class="vehicle-title">${v.year} ${v.brand} ${v.model}</span>
                    <span class="vehicle-owner"><i class="fa-regular fa-user"></i> ${v.ownerId.substring(0,8)}...</span>
                </div>
            </td>
            <td><span class="remaining-days">${remDays} gün</span></td>
            <td><span class="status-badge ${statusClass}">${v.inspectionStatus || "BELİRSİZ"}</span></td>
            <td><span class="status-badge ${insStatusClass}">${v.insuranceStatus || "BELİRSİZ"}</span></td>
            <td><span class="bodytype-text"><i class="fa-solid fa-car-side"></i> ${v.bodyType || "Sedan"}</span></td>
            <td class="action-cell"><i class="fa-solid fa-ellipsis-vertical"></i></td>
        `;
        tableBody.appendChild(row);
    });
}

// 6. Filtreleme Mantığı (Lokal Arama)
function filterVehicles(e) {
    const query = e.target.value.toLowerCase();
    const filtered = vehicles.filter(v => 
        v.plate.toLowerCase().includes(query) ||
        v.brand.toLowerCase().includes(query) ||
        v.model.toLowerCase().includes(query) ||
        (v.chassisNumber && v.chassisNumber.toLowerCase().includes(query))
    );
    renderVehicles(filtered);
}

function filterVehiclesGlobal(e) {
    const query = e.target.value.toLowerCase();
    const filtered = vehicles.filter(v => 
        v.plate.toLowerCase().includes(query) ||
        v.brand.toLowerCase().includes(query) ||
        v.model.toLowerCase().includes(query)
    );
    renderVehicles(filtered);
}

// 7. Modal Aç / Kapat
function openAddVehicleModal() {
    document.getElementById("addVehicleModal").classList.add("open");
}

function closeAddVehicleModal() {
    document.getElementById("addVehicleModal").classList.remove("open");
    document.getElementById("addVehicleForm").reset();
}

// 8. Yeni Araç Ekle (Form Submit)
async function handleFormSubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");
    
    const payload = {
        plate: document.getElementById("plate").value.trim().toUpperCase(),
        brand: document.getElementById("brand").value.trim(),
        model: document.getElementById("model").value.trim(),
        year: parseInt(document.getElementById("year").value),
        bodyType: parseInt(document.getElementById("bodyType").value),
        engineNumber: document.getElementById("engineNumber").value.trim(),
        chassisNumber: document.getElementById("chassisNumber").value.trim(),
        ownerId: document.getElementById("ownerId").value.trim()
    };

    // Muayene ve Sigorta tarihleri girilmişse ekle
    const inspectionVal = document.getElementById("inspectionDate").value;
    if (inspectionVal) {
        payload.inspectionDate = new Date(inspectionVal).toISOString();
    }
    
    const insuranceVal = document.getElementById("insuranceEndDate").value;
    if (insuranceVal) {
        payload.insuranceEndDate = new Date(insuranceVal).toISOString();
    }

    try {
        const response = await fetch(API_VEHICLE_URL, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("Kuyruğa ekleme başarısız");

        closeAddVehicleModal();
        alert("Araç oluşturma isteği RabbitMQ kuyruğuna gönderildi!");
        
        setTimeout(fetchVehicles, 2000);
        
    } catch (error) {
        console.error("Araç ekleme hatası:", error);
        alert("Araç eklenirken bir hata oluştu.");
    }
}

// 9. Güncel Döviz Kurlarını Çek
async function fetchExchangeRates() {
    try {
        const response = await fetch("https://open.er-api.com/v6/latest/USD");
        if (!response.ok) throw new Error("Döviz servisi hatası");
        
        const data = await response.json();
        
        // Kurları hesapla (USD bazlı)
        const usdToTry = data.rates.TRY;
        const usdToEur = data.rates.EUR;
        
        // 1 EUR = ne kadar TRY? (1 / usdToEur) * usdToTry
        const eurToTry = (1 / usdToEur) * usdToTry;

        // Arayüzü güncelle
        document.getElementById("usd-rate").innerText = "₺" + usdToTry.toFixed(2);
        document.getElementById("eur-rate").innerText = "₺" + eurToTry.toFixed(2);
    } catch (error) {
        console.error("Kurlar güncellenemedi:", error);
        // Hata durumunda varsayılan/statik değerleri göster
        document.getElementById("usd-rate").innerText = "₺45.61";
        document.getElementById("eur-rate").innerText = "₺52.97";
    }
}
