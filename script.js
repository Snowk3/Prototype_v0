document.addEventListener("DOMContentLoaded", function () {
  // Elementos del DOM
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

  // Alerta monto -
  function mostrarAlertaMonto(input, valorConocido, valorIngresado) {
    // Remove any existing alert
    const existingAlert = input.parentElement.querySelector(".alerta-monto");
    if (existingAlert) {
      existingAlert.remove();
    }
    // Check if value exceeds threshold (30% more than known value)
    if (valorIngresado > valorConocido * 1.3) {
      const alertaDiv = document.createElement("div");
      alertaDiv.className = "alerta-monto";
      alertaDiv.textContent =
        "El monto ingresado es superior al conocido por el SII ¿Está seguro de ingresar?";
      input.parentElement.appendChild(alertaDiv);
    }
  }

  // Modify the input event listeners
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

  // Inicializar botón validar
  if (validarBtn) {
    validarBtn.disabled = true;
  }

  // Códigos conocidos con sus valores esperados y referencias
  const codigosConocidos = {
    502: 490411443 /*29030076*/,
    717: 0,
    111: 181825142 /*29030230*/,
    513: 116546 /*29030086*/,
    510: 17036897 /*29030088*/,
    709: 12184029 /*29030090*/,
    734: 0,
    517: 0,
    501: 167773872 /*29030154 - LIQUIDACIÓN FACTURA*/,
    759: 7592884971 /*29030084*/,
    764: 0,
    409: 0,
  };

  // INGRESAR - PROPUESTA Add after codigosConocidos declaration
  function ingresarPropuesta() {
    // Iterar sobre cada input
    inputs.forEach((input) => {
      const codigo =
        input.getAttribute("data-codigo") ||
        input.parentElement.previousElementSibling.textContent.trim();

      // Si el código existe en codigosConocidos, asignar el valor
      if (codigo in codigosConocidos) {
        input.value = codigosConocidos[codigo];
      }
    });

    // Recalcular totales
    calcularTotal538();

    // Habilitar botón de validar
    if (validarBtn) {
      validarBtn.disabled = false;
    }
  }

  // Add to Event Listeners section
  const ingresarPropuestaBtn = document.getElementById("ingresarPropuestaBtn");
  if (ingresarPropuestaBtn) {
    ingresarPropuestaBtn.addEventListener("click", ingresarPropuesta);
  }

  // Función para calcular el discriminante W01
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
  // Función para mostrar alerta temporal
  function mostrarAlertaTemporal(mensaje, tipo) {
    return new Promise((resolve) => {
      const alertaTemp = document.createElement("div");
      alertaTemp.className = `alerta-temporal ${tipo}`;
      alertaTemp.textContent = mensaje;
      document.body.appendChild(alertaTemp);

      setTimeout(() => alertaTemp.classList.add("mostrar"), 100);

      setTimeout(() => {
        alertaTemp.classList.remove("mostrar");
        setTimeout(() => {
          alertaTemp.remove();
          resolve();
        }, 200);
      }, 1000);
    });
  }

  // Función para validar códigos
  async function validarCodigos(event) {
    event.preventDefault();

    // Limpiar contenido previo
    tbody.innerHTML = "";
    discriminanteDiv.innerHTML = "";
    let hayDiferencias = false;

    // Enable enviar button after validation
    if (enviarBtn) {
      enviarBtn.disabled = false;
    }

    // Obtener valores actuales
    const valoresActuales = {};
    inputs.forEach((input) => {
      const codigo =
        input.getAttribute("data-codigo") ||
        input.parentElement.previousElementSibling.textContent.trim();
      valoresActuales[codigo] = Number(input.value) || 0;
    });

    // Calcular discriminantes
    const discriminanteIngresado = calcularDiscriminanteW01(valoresActuales);
    const discriminanteEsperado = calcularDiscriminanteW01(codigosConocidos);
    const diferenciaDiscriminante =
      discriminanteIngresado - discriminanteEsperado;

    if (diferenciaDiscriminante !== 0) {
      hayDiferencias = true;
    }

    // Mostrar alerta temporal primero
    await mostrarAlertaTemporal(
      hayDiferencias
        ? "Se han detectado diferencias en los códigos ingresados"
        : "Todos los códigos coinciden con los valores esperados",
      hayDiferencias ? "error" : "success"
    );

    // Preparar contenido del popup
    discriminanteDiv.innerHTML = `
      <div class="discriminante-w01 ${
        hayDiferencias ? "diferencia-encontrada" : ""
      }">
        <h3>Discriminante W01</h3>
        <p>Valor Ingresado: ${discriminanteIngresado}</p>
        <p>Valor Esperado: ${discriminanteEsperado}</p>
        <p>Diferencia: ${diferenciaDiscriminante}</p>
      </div>
    `;

    // Comparar valores individuales
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
        <td>${valorActual}</td>
        <td>${valorEsperado}</td>
        <td>${diferencia}</td>
        <td><a href="https://www.sii.cl" target="_blank">Ver ayuda</a></td>
      `;
      tbody.appendChild(tr);
    });

    // Mostrar popup después de que se complete la alerta temporal
    setTimeout(() => {
      popup.style.display = "block";
    }, 1200); //
  }

  // Función para cerrar popup
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

  // Función para calcular el total del código 538
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

  // Función para calcular el total del código 91
  function calcularTotal91(codigos) {
    var total91 = codigos["538"] + codigos["409"];
    codigos["91"] = total91;
    document.getElementById("total-monto-91").value = total91;
  }

  // Event Listeners
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

  // Add to the borrarDatos event listener to disable enviarBtn when clearing
  if (borrarDatosBtn) {
    borrarDatosBtn.addEventListener("click", function () {
      inputs.forEach((input) => (input.value = ""));
      calcularTotal538();
      if (validarBtn) validarBtn.disabled = true;
      if (enviarBtn) enviarBtn.disabled = true; // Disable enviar button when clearing
    });
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

  // Inicialización
  calcularTotal538();
});

// Initialize enviarBtn as disabled
if (enviarBtn) {
  enviarBtn.disabled = true;
}
