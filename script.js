// Add a helper function for number formatting
function formatNumber(number) {
  return number.toLocaleString("es-CL");
}

// Add a helper function to parse formatted numbers
function parseFormattedNumber(str) {
  return Number(str.replace(/\./g, "")) || 0;
}

document.addEventListener("DOMContentLoaded", function () {
  // Elementos del DOMY
  const validarBtn = document.getElementById("validarBtn");
  const borrarDatosBtn = document.getElementById("borrarDatosBtn");
  const tooltipIcons = document.querySelectorAll(".tooltip-icon");
  const inputs = document.querySelectorAll(".val-input");
  const coll = document.getElementsByClassName("collapse-button");
  const popup = document.getElementById("validacionPopup");
  const tbody = document.getElementById("resultadosValidacion");
  const discriminanteDiv = document.getElementById("discriminanteW01");
  const alertaValidacion = document.getElementById("alertaValidacion");
  const enviarBtn = document.getElementById("enviarBtn");
  const ingresarPropuestaBtn = document.getElementById("ingresarPropuestaBtn");

  // Códigos conocidos con sus valores esperados y referencias
  const codigosConocidos = {
    502: 11978778766 /*29030076*/,
    717: 9246037 /*29030080*/,
    111: 34953383064 /*29030230*/,
    513: 0 /*29030086*/,
    510: 113470700 /*29030088*/,
    709: 31100490 /*29030090*/,
    734: 0 /*29030092*/,
    517: 0,
    501: 34189569 /*29030154  29030155 - LIQUIDACIÓN FACTURA*/,
    759: 0 /*29030084*/,
    764: 0,
    409: 0,
  };

  // Función para validar montos superiores e inferiores
  function mostrarAlertaMonto(input, valorConocido, valorIngresado) {
    const existingAlert = input.parentElement.querySelector(".alerta-monto");
    if (existingAlert) {
      existingAlert.remove();
    }

    if (valorIngresado > valorConocido * 1.3) {
      const alertaDiv = document.createElement("div");
      alertaDiv.className = "alerta-monto";
      alertaDiv.textContent =
        "El monto ingresado es superior al conocido por el SII ¿Está seguro de ingresar?";
      input.parentElement.appendChild(alertaDiv);
    } else if (valorIngresado < valorConocido * 0.7) {
      const alertaDiv = document.createElement("div");
      alertaDiv.className = "alerta-monto";
      alertaDiv.textContent =
        "El monto ingresado es inferior al conocido por el SII ¿Está seguro de ingresar?";
      input.parentElement.appendChild(alertaDiv);
    }
  }
  //calculo discriminante w01
  function calcularDiscriminanteW01(valores) {
    return (
      valores["502"] +
      valores["764"] +
      valores["717"] +
      valores["111"] +
      valores["759"] +
      valores["513"] -
      valores["510"] -
      valores["709"] -
      valores["734"] +
      valores["517"] +
      valores["501"]
    );
  }
  // Alerta Temporal Validador
  function mostrarAlertaTemporal(mensaje, tipo) {
    return new Promise((resolve) => {
      const alertaTemp = document.createElement("div");
      alertaTemp.className = `alerta-temporal ${tipo}`;
      alertaTemp.textContent = mensaje;
      document.body.appendChild(alertaTemp);
      // Mostrar alerta
      setTimeout(() => alertaTemp.classList.add("mostrar"), 100);
      // Ocultar después de 2 segundos
      setTimeout(() => {
        alertaTemp.classList.remove("mostrar");
        setTimeout(() => {
          alertaTemp.remove();
          resolve();
        }, 400);
      }, 2000);
    });
  }
  // Modify validarCodigos
  async function validarCodigos(event) {
    event.preventDefault();
    tbody.innerHTML = "";
    discriminanteDiv.innerHTML = "";
    let hayDiferencias = false;

    if (enviarBtn) {
      enviarBtn.disabled = false;
    }

    const valoresActuales = {};
    inputs.forEach((input) => {
      const codigo =
        input.getAttribute("data-codigo") ||
        input.parentElement.previousElementSibling.textContent.trim();
      valoresActuales[codigo] = parseFormattedNumber(input.value);
    });

    const discriminanteIngresado = calcularDiscriminanteW01(valoresActuales);
    const discriminanteEsperado = calcularDiscriminanteW01(codigosConocidos);
    const diferenciaDiscriminante =
      discriminanteIngresado - discriminanteEsperado;

    if (diferenciaDiscriminante !== 0) {
      hayDiferencias = true;
    }

    await mostrarAlertaTemporal(
      hayDiferencias
        ? "Se han detectado diferencias en los códigos ingresados"
        : "Todos los códigos coinciden con los valores esperados",
      hayDiferencias ? "error" : "success"
    );

    discriminanteDiv.innerHTML = `
    <div class="discriminante-w01 ${
      hayDiferencias ? "diferencia-encontrada" : ""
    }">
      <h3>Discriminante W01</h3>
      <p>Valor Ingresado: ${formatNumber(discriminanteIngresado)}</p>
      <p>Valor Esperado: ${formatNumber(discriminanteEsperado)}</p>
      <p>Diferencia: ${formatNumber(diferenciaDiscriminante)}</p>
    </div>
  `;

    Object.keys(codigosConocidos).forEach((codigo) => {
      const valorActual = valoresActuales[codigo] || 0;
      const valorEsperado = codigosConocidos[codigo];
      const diferencia = valorActual - valorEsperado;

      const tr = document.createElement("tr");
      if (diferencia !== 0) {
        tr.classList.add("diferencia-encontrada");
      }

      tr.innerHTML = `
    <td>${codigo}</td>
    <td>${formatNumber(valorActual)}</td>
    <td>${formatNumber(valorEsperado)}</td>
    <td>${formatNumber(diferencia)}</td>
    <td><a href="https://www.sii.cl" target="_blank">Ver ayuda</a></td>
  `;
      tbody.appendChild(tr);
    });

    setTimeout(() => {
      popup.style.display = "block";
    }, 2200);
  }

  function cerrarPopup() {
    popup.style.opacity = "0";
    setTimeout(() => {
      popup.style.display = "none";
      popup.style.opacity = "1";
      if (alertaValidacion) {
        alertaValidacion.innerHTML = "";
        alertaValidacion.style.display = "none";
      }
    }, 300);
  }

  function calcularTotal538() {
    var codigos = {
      502: 0,
      717: 0,
      111: 0,
      513: 0,
      510: 0,
      709: 0,
      734: 0,
      517: 0,
      501: 0,
      154: 0,
      518: 0,
      713: 0,
      741: 0,
      759: 0,
      764: 0,
      791: 0,
      409: 0,
    };

    inputs.forEach(function (input) {
      var codigo =
        input.getAttribute("data-codigo") ||
        input.parentElement.previousElementSibling.textContent.trim();
      var valor = Number(input.value) || 0;
      if (codigos.hasOwnProperty(codigo)) {
        codigos[codigo] = valor;
      }
    });

    var total538 = calcularDiscriminanteW01(codigos);
    codigos["538"] = total538;
    document.getElementById("total-monto-538").value = total538;
    calcularTotal91(codigos);
  }

  function calcularTotal91(codigos) {
    var total91 = codigos["538"] + codigos["409"];
    codigos["91"] = total91;
    document.getElementById("total-monto-91").value = total91;
  }

  function ingresarPropuesta() {
    inputs.forEach((input) => {
      const codigo =
        input.getAttribute("data-codigo") ||
        input.parentElement.previousElementSibling.textContent.trim();

      if (codigo in codigosConocidos) {
        input.value = codigosConocidos[codigo];
      }
    });

    calcularTotal538();

    if (validarBtn) {
      validarBtn.disabled = false;
    }
  }

  function toggleCollapse() {
    this.classList.toggle("active");
    const content = this.nextElementSibling;
    content.style.maxHeight = content.style.maxHeight
      ? null
      : content.scrollHeight + "px";
  }

  function toggleTooltip() {
    const tooltipContent = this.nextElementSibling;
    tooltipContent.style.visibility =
      tooltipContent.style.visibility === "visible" ? "hidden" : "visible";
    tooltipContent.style.opacity =
      tooltipContent.style.opacity === "1" ? "0" : "1";
  }

  // Inicialización
  if (validarBtn) {
    validarBtn.disabled = true;
  }

  if (enviarBtn) {
    enviarBtn.disabled = true;
  }

  inputs.forEach((input) => {
    input.addEventListener("input", function () {
      if (validarBtn) validarBtn.disabled = false;

      const codigo =
        input.getAttribute("data-codigo") ||
        input.parentElement.previousElementSibling.textContent.trim();
      const valorIngresado = Number(this.value) || 0;
      const valorConocido = codigosConocidos[codigo] || 0;

      mostrarAlertaMonto(input, valorConocido, valorIngresado);
      calcularTotal538();
    });
  });

  if (validarBtn) {
    validarBtn.addEventListener("click", (e) =>
      validarCodigos(e).catch(console.error)
    );
  }

  document
    .getElementById("cerrarValidacion")
    .addEventListener("click", cerrarPopup);

  inputs.forEach((input) => {
    input.addEventListener("input", function () {
      if (validarBtn) validarBtn.disabled = false;
      calcularTotal538();
    });
  });

  Array.from(coll).forEach((button) =>
    button.addEventListener("click", toggleCollapse)
  );

  if (borrarDatosBtn) {
    borrarDatosBtn.addEventListener("click", function () {
      inputs.forEach((input) => (input.value = ""));
      calcularTotal538();
      if (validarBtn) validarBtn.disabled = true;
      if (enviarBtn) enviarBtn.disabled = true;
    });
  }

  if (ingresarPropuestaBtn) {
    ingresarPropuestaBtn.addEventListener("click", ingresarPropuesta);
  }

  tooltipIcons.forEach((icon) => {
    icon.addEventListener("click", toggleTooltip);
    icon.addEventListener("mouseenter", function () {
      const tooltipContent = this.nextElementSibling;
      tooltipContent.style.visibility = "visible";
      tooltipContent.style.opacity = "1";
    });
    icon.addEventListener("mouseleave", function () {
      const tooltipContent = this.nextElementSibling;
      tooltipContent.style.visibility = "hidden";
      tooltipContent.style.opacity = "0";
    });
  });

  calcularTotal538();
});
