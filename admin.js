// Credenciais simples para acesso local do Admin
const ADMIN_USER = 'admin';
const ADMIN_PASS = '123456'; 

// Elementos de UI - Login e Dashboard
const loginSection = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');

const carFormModal = document.getElementById('car-form-modal');
const formModalClose = document.getElementById('form-modal-close');
const carForm = document.getElementById('car-form');
const targetId = document.getElementById('car-id');
const btnAddCar = document.getElementById('btn-add-car');
const modalTitle = document.getElementById('form-modal-title');

// Var global que armazena as fotos do carrossel na tentativa atual de insert/edit
let currentGaleria = [];

// Banco de Dados Auxiliar de Modelos para o Dropbox em Cascata
const carModelsDB = {
    'PORSCHE': ['911 CARRERA S', '911 TURBO S', '911 GT3 RS', 'TAYCAN TURBO S', 'CAYENNE TURBO GT', 'PANAMERA S', 'MACAN GTS'],
    'FERRARI': ['F8 TRIBUTO', 'SF90 STRADALE', 'ROMA', 'PORTOFINO M', '296 GTB', 'PUROSANGUE', '812 SUPERFAST'],
    'BMW': ['M3 COMPETITION', 'M4 COMPETITION', 'M5 COMPETITION', 'M8 COMPETITION', 'X6 M', 'X5 M', 'iX M60'],
    'AMG': ['GT BLACK SERIES', 'G63 AMG', 'C63 S', 'E63 S AMG', 'AMG ONE', 'SL 63', 'GT 63 S E-PERFORMANCE'],
    'AUDI': ['R8 V10 PLUS', 'RS6 AVANT', 'RS Q8', 'RS E-TRON GT', 'RS7 SPORTBACK'],
    'LAMBORGHINI': ['HURACÁN STO', 'HURACÁN PERFORMANTE', 'AVENTADOR SVJ', 'URUS PERFORMANTE', 'REVUELTO'],
    'MCLAREN': ['720S', '765LT', 'ARTURA', 'SENNA', 'P1', 'MCLAREN GT'],
    'ASTON MARTIN': ['DBX 707', 'VANTAGE F1 EDITION', 'DBS SUPERLEGGERA', 'VALKYRIE'],
    'LAND ROVER': ['RANGE ROVER SPORT SVR', 'DEFENDER V8', 'VELAR SV AUTOBIOGRAPHY'],
    'FIAT': ['500 ABARTH', 'PULSE ABARTH', 'FASTBACK ABARTH', 'MOBI TREKKING', 'CRONOS PRECISION']
};

const selectMarca = document.getElementById('car-marca');
const selectModelo = document.getElementById('car-modelo');

// Popula o dropbox de Modelos dinamicamente
const populateModelos = (marca, preSelectModelo = null) => {
    selectModelo.innerHTML = '<option value="" disabled selected>Selecione o Modelo...</option>';
    
    // Fallback: se tivermos no BD um carro com marca que não exista neste Array, adicionamos a marca dinamicamente
    let modelsArray = carModelsDB[marca];
    if (!modelsArray) {
        modelsArray = preSelectModelo ? [preSelectModelo] : ['Modelo Personalizado'];
    }

    selectModelo.disabled = false;
    modelsArray.forEach(modelo => {
        const opt = document.createElement('option');
        opt.value = modelo;
        opt.innerText = modelo;
        if (modelo === preSelectModelo) opt.selected = true;
        selectModelo.appendChild(opt);
    });
};

selectMarca.addEventListener('change', (e) => {
    populateModelos(e.target.value);
});

// Verificação de Autenticação Sessão
const checkAuth = () => {
    if (sessionStorage.getItem('mhp_admin_logged') === 'true') {
        loginSection.style.display = 'none';
        dashboardSection.style.display = 'block';
        renderTable();
    } else {
        loginSection.style.display = 'flex';
        dashboardSection.style.display = 'none';
    }
}

// Formatador Monetário Local
const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
};

// Gerenciador de Banco de Dados Local (localStorage)
// Garante o carregamento dos itens da mesma fonte que a home do site buscará
let cars = JSON.parse(localStorage.getItem('mhp_cars')) || [];

const saveCars = () => {
    localStorage.setItem('mhp_cars', JSON.stringify(cars));
    renderTable(); // Atualiza a tabela imediatamente após salvar
};

const renderTable = (searchTerm = "") => {
    const tbody = document.getElementById('admin-table-body');
    tbody.innerHTML = '';
    
    // Atualiza o banco do LocalStorage para espelhar a tela
    cars = JSON.parse(localStorage.getItem('mhp_cars')) || [];
    
    // Filtro simulando um "%LIKE%" no Banco de Dados
    const filteredCars = cars.filter(car => {
        const textToSearch = `${car.id} ${car.marca} ${car.modelo} ${car.ano}`.toLowerCase();
        return textToSearch.includes(searchTerm.toLowerCase());
    });
    
    // Lista todos os itens cruzados e constrói linhas (<tr>)
    filteredCars.forEach(car => {
        const tr = document.createElement('tr');
        
        let tagBadge = car.novidade 
            ? '<span style="background: var(--color-red); padding: 4px 8px; font-size: 0.7rem; font-weight: bold; border-radius: 4px; color: white;">NOVIDADE</span>'
            : '<span style="color: var(--color-muted); font-size: 0.8rem;">PADRÃO</span>';

        tr.innerHTML = `
            <td style="color: var(--color-muted); font-weight: bold;">#${car.id}</td>
            <td><img src="${car.imagem}" alt="carro mockup"></td>
            <td><strong style="font-size: 1.1rem; display:block; margin-bottom:4px;">${car.marca}</strong> ${car.modelo}</td>
            <td>${car.ano} <br><small style="color:var(--color-muted)">${car.km}</small></td>
            <td style="font-weight: bold; color: white;">${formatCurrency(car.preco)}</td>
            <td>${tagBadge}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-small btn-edit" onclick="editCar(${car.id})">EDITAR</button>
                    <button class="btn-small btn-delete" onclick="deleteCar(${car.id})">EXCLUIR</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
    // Dashboard Statistics Calculation
    let bruto = 0;
    cars.forEach(car => {
        bruto += car.preco;
    });

    // Update UI Stats
    document.getElementById('stat-qtd').innerText = cars.length;
    document.getElementById('stat-bruto').innerText = formatCurrency(bruto);

    // Render Revenue (Faturamento)
    const faturamento = JSON.parse(localStorage.getItem('mhp_faturamento')) || 0;
    document.getElementById('stat-faturamento').innerText = formatCurrency(faturamento);
};

/* --- Eventos Administrativos --- */

// Efetuar Login
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const u = document.getElementById('admin-user').value;
    const p = document.getElementById('admin-pass').value;
    
    if (u === ADMIN_USER && p === ADMIN_PASS) {
        sessionStorage.setItem('mhp_admin_logged', 'true');
        loginError.style.display = 'none';
        checkAuth();
    } else {
        loginError.style.display = 'block';
    }
});

// Efetuar Logout
logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('mhp_admin_logged');
    checkAuth();
});

// Filtro de Busca da Tabela
const searchInput = document.getElementById('admin-search-input');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        renderTable(e.target.value);
    });
}

// Aciona Modal Adicionar Veículo Vazio
btnAddCar.addEventListener('click', () => {
    modalTitle.innerText = "NOVO VEÍCULO";
    carForm.reset();
    targetId.value = "";
    selectModelo.innerHTML = '<option value="" disabled selected>Primeiro selecione a Marca...</option>';
    selectModelo.disabled = true;
    
    // Limpa imagem preview da Capa
    document.getElementById('car-imagem-file').value = '';
    document.getElementById('car-imagem-base64').value = '';
    const preview = document.getElementById('car-imagem-preview');
    preview.src = '';
    preview.style.display = 'none';
    
    // Limpa galeria de fotos (Carrossel)
    currentGaleria = [];
    document.getElementById('car-galeria-file').value = '';
    document.getElementById('car-galeria-preview').innerHTML = '';
    
    carFormModal.classList.add('active');
});

// Helper Function -> Comprime Imagem Base64 Return Promise
const compressImageFile = (file, maxWidth = 1000, quality = 0.6) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
};

// Manipulador de Upload e Compressão da capa
const carImageFile = document.getElementById('car-imagem-file');
const carImageBase64 = document.getElementById('car-imagem-base64');
const carImagePreview = document.getElementById('car-imagem-preview');

carImageFile.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
        const base64Str = await compressImageFile(file, 1000, 0.6);
        carImageBase64.value = base64Str;
        carImagePreview.src = base64Str;
        carImagePreview.style.display = 'block';
    }
});

// Manipulador da Galeria (MultiUpload)
const carGaleriaFile = document.getElementById('car-galeria-file');
const carGaleriaPreview = document.getElementById('car-galeria-preview');

// Função isolada para renderizar o array visualmente
const renderGaleriaPreview = () => {
    carGaleriaPreview.innerHTML = '';
    currentGaleria.forEach((base64Str, idx) => {
        const wrap = document.createElement('div');
        wrap.style.position = 'relative';
        
        const img = document.createElement('img');
        img.src = base64Str;
        img.style.width = '100px';
        img.style.height = '70px';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '4px';
        img.style.border = '1px solid var(--color-border)';
        
        const btnRemove = document.createElement('button');
        btnRemove.innerText = 'X';
        btnRemove.style.position = 'absolute';
        btnRemove.style.top = '-5px';
        btnRemove.style.right = '-5px';
        btnRemove.style.background = 'var(--color-red)';
        btnRemove.style.color = 'white';
        btnRemove.style.border = 'none';
        btnRemove.style.borderRadius = '50%';
        btnRemove.style.width = '20px';
        btnRemove.style.height = '20px';
        btnRemove.style.cursor = 'pointer';
        btnRemove.style.fontSize = '12px';
        btnRemove.onclick = (ev) => {
            ev.preventDefault();
            currentGaleria.splice(idx, 1);
            renderGaleriaPreview();
        };

        wrap.appendChild(img);
        wrap.appendChild(btnRemove);
        carGaleriaPreview.appendChild(wrap);
    });
};

carGaleriaFile.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files);
    
    // Mostra um carregando nas miniaturas
    carGaleriaPreview.innerHTML = '<span style="color:var(--color-muted); font-size:12px;">Comprimindo imagens e carregando galeria... aguarde</span>';
    
    for (let file of files) {
        // Reduz ainda mais a galeria pra não estourar rápido, 800px no máximo a 50% compressão
        const base64Str = await compressImageFile(file, 800, 0.5);
        currentGaleria.push(base64Str);
    }
    
    // Limpa o form pra evitar reenviar a mesma batch se der re-select 
    carGaleriaFile.value = ''; 
    renderGaleriaPreview();
});

// Fechar modal ao clicar no X
formModalClose.addEventListener('click', () => {
    carFormModal.classList.remove('active');
});

// Submit Formulário de Carro (Salvar adição ou edição)
carForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Pega o ID caso já exista (Edição), ou gera um Timestamp novo (Adição)
    const id = targetId.value ? parseInt(targetId.value) : Date.now();
    
    const base64Image = document.getElementById('car-imagem-base64').value;
    
    if (!base64Image) {
        alert("🚨 Atenção: Você precisa anexar uma imagem para o veículo.");
        return;
    }
    
    const newCar = {
        id: id,
        marca: document.getElementById('car-marca').value,
        modelo: document.getElementById('car-modelo').value,
        ano: document.getElementById('car-ano').value, // manter string format ou parseint de acordo com preferência
        km: document.getElementById('car-km').value,
        preco: parseFloat(document.getElementById('car-preco').value),
        imagem: base64Image,
        galeria: currentGaleria,
        novidade: document.getElementById('car-novidade').value === 'true'
    };
    
    if (targetId.value) {
        // Se targetId tem valor, encontra index e substitui (Update)
        const index = cars.findIndex(c => c.id === id);
        if(index > -1) cars[index] = newCar;
    } else {
        // Se está vazio é um novo cadastro (Create) -> Coloca na ponta inicial
        cars.unshift(newCar);
    }
    
    saveCars();
    carFormModal.classList.remove('active');
});


/* --- Funções Globais Injetadas no HTML (Botões de Linha) --- */

window.editCar = (id) => {
    const car = cars.find(c => c.id === id);
    if (!car) return;
    
    modalTitle.innerText = "EDITAR VEÍCULO";
    targetId.value = car.id;
    
    // Seta a marca primeiro e recria as categorias de Modelos disponíveis baseadas nessa marca
    document.getElementById('car-marca').value = car.marca;
    populateModelos(car.marca, car.modelo);
    
    document.getElementById('car-ano').value = car.ano;
    document.getElementById('car-km').value = car.km;
    document.getElementById('car-preco').value = car.preco;
    document.getElementById('car-novidade').value = car.novidade ? 'true' : 'false';
    
    // Instancia os elementos de preview com a imagem principal
    document.getElementById('car-imagem-file').value = ''; // Limpa
    document.getElementById('car-imagem-base64').value = car.imagem;
    
    const preview = document.getElementById('car-imagem-preview');
    preview.src = car.imagem;
    preview.style.display = 'block';
    
    // Instancia e renderiza a galeria pre-existente
    currentGaleria = car.galeria ? [...car.galeria] : []; // Faz um clone pra não quebrar a ref array
    document.getElementById('car-galeria-file').value = '';
    renderGaleriaPreview();
    
    carFormModal.classList.add('active');
};

window.deleteCar = (id) => {
    const car = cars.find(c => c.id === id);
    if (!car) return;
    if (confirm(`🚨 TEM CERTEZA que deseja excluir o ${car.marca} ${car.modelo}?`)) {
        // Confirmação para saber se foi uma venda ou apenas remoção técnica
        if (confirm(`💰 Esse veículo foi VENDIDO? (Clique OK para adicionar ${formatCurrency(car.preco)} ao Faturamento do Mês, ou no botão de Cancelar se for apenas uma remoção de anúncio).`)) {
            // Guarda o carro completo no histórico de vendas
            let vendas = JSON.parse(localStorage.getItem('mhp_vendas_mes')) || [];
            car.data_venda = new Date().toISOString();
            vendas.push(car);
            localStorage.setItem('mhp_vendas_mes', JSON.stringify(vendas));

            // Mantém cálculo do painel simples para faturamento
            let faturamento = JSON.parse(localStorage.getItem('mhp_faturamento')) || 0;
            faturamento += car.preco;
            localStorage.setItem('mhp_faturamento', JSON.stringify(faturamento));
        }

        cars = cars.filter(c => c.id !== id);
        saveCars();
    }
};

/* --- Exportação Excel (CSV) Relatório de Faturamento Mensal --- */
document.getElementById('btn-export-excel').addEventListener('click', () => {
    let vendas = JSON.parse(localStorage.getItem('mhp_vendas_mes')) || [];
    
    if (vendas.length === 0) {
        alert("Ainda não existem vendas registradas no sistema nesse mês para gerar o relatório.");
        return;
    }

    const csvRows = [];
    csvRows.push("RELATORIO MENSAL DE VEICULOS VENDIDOS (FATURAMENTO)");
    csvRows.push("");
    // Cabeçalho compatível com Excel pt-BR
    csvRows.push("DATA DA VENDA;ID ORIGINAL;MARCA;MODELO;ANO;KM;VALOR DA VENDA");
    
    let faturamentoAcumulado = 0;
    
    vendas.forEach(car => {
        const dataStr = new Date(car.data_venda).toLocaleDateString('pt-BR');
        // Envolve strings em aspas e usa Ponto e Vírgula para colunas
        const row = `${dataStr};${car.id};${car.marca};"${car.modelo}";"${car.ano}";"${car.km}";${car.preco}`;
        csvRows.push(row);
        faturamentoAcumulado += car.preco;
    });
    
    csvRows.push("");
    csvRows.push(`;;;;;TOTAL FATURADO:;${faturamentoAcumulado}`);
    
    const csvString = csvRows.join("\n");
    // BOM (\uFEFF) para forçar o Excel a reconhecer o UTF-8 correto
    const blob = new Blob(["\uFEFF" + csvString], { type: 'text/csv; charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio_faturamento_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// Start Runtime inicial da pagina
checkAuth();
