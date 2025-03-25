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
    //Creditos
    520: 37939779880 /*29030108*/ /*29030320*/,
    525: 0 /*29030138*/,
    762: 5735894 /*29030118*/,
    766: 0 /*29030128*/,
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

  // Discriminante W08
  function calcularDiscriminanteW08(valores) {
    return valores["520"] + valores["525"] + valores["762"] + valores["766"];
  }
  // Discriminante W03
  function calcularDiscriminanteW03(valores) {
    return valores["502"] + valores["111"] + valores["513"] - valores["510"];
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
      }, 3000);
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
    // DISCRINANTE W01
    const discriminanteIngresado = calcularDiscriminanteW01(valoresActuales);
    const discriminanteEsperado = calcularDiscriminanteW01(codigosConocidos);
    const diferenciaDiscriminante =
      discriminanteIngresado - discriminanteEsperado;

    // DISCRINANTE W08
    const discriminanteW08Ingresado = calcularDiscriminanteW08(valoresActuales);
    const discriminanteW08Esperado = calcularDiscriminanteW08(codigosConocidos);
    const diferenciaDiscriminanteW08 =
      discriminanteW08Ingresado - discriminanteW08Esperado;

    // Check all discriminantes for differences
    const diferencias = {
      w01: diferenciaDiscriminante !== 0,
      w08: diferenciaDiscriminanteW08 !== 0,
    };
    //CHEQUEA DIFERENCIAS
    hayDiferencias = Object.values(diferencias).some((diff) => diff);

    // Create detailed message for alert
    const mensajeDiferencias = [];
    if (diferencias.w01) mensajeDiferencias.push("W01");
    if (diferencias.w08) mensajeDiferencias.push("W08");

    // Inside validarCodigos function, replace the button update section
    Object.entries(diferencias).forEach(([tipo, tieneDiferencia]) => {
      const pageId = tipo === "w08" ? "w02" : tipo; // Map w08 to w02 button
      const button = document.querySelector(
        `.sidebar-btn[data-page="${pageId}"]`
      );

      if (button) {
        if (tieneDiferencia) {
          button.classList.add("has-difference");
        } else {
          button.classList.remove("has-difference");
        }
      }
    });

    const mensaje = hayDiferencias
      ? `Se han detectado diferencias en las observaciones: ${mensajeDiferencias.join(
          ", "
        )}`
      : "Su declaración no presenta diferencias significativas con la información conocida por Servicio de Impuestos Internos. Avanzar al Envio y pago del Formulario F29";

    await mostrarAlertaTemporal(mensaje, hayDiferencias ? "error" : "success");

    // #page-w01
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

    // #page-w08
    document.querySelector("#page-w02").innerHTML = `
    <h2>Validación de Códigos</h2>
    <h3>Observación W08</h3>
    <h4>El IVA crédito fiscal declarado por el contribuyente en sus F29, asociado a los distintos tipos de facturas que soportan créditos; resulta mayor al IVA crédito fiscal registrado en su Registro de Compras (RC) o Información Electrónica de Compras (IEC).</h4>
    <div class="discriminante-w08 ${
      diferenciaDiscriminanteW08 !== 0 ? "diferencia-encontrada" : ""
    }">
      <h3>Discriminante W08</h3>
      <p>Valor Ingresado: ${formatNumber(discriminanteW08Ingresado)}</p>
      <p>Valor Esperado: ${formatNumber(discriminanteW08Esperado)}</p>
      <p>Diferencia: ${formatNumber(diferenciaDiscriminanteW08)}</p>
    </div>
    <div id="alertaValidacionW08" class="alerta"></div>
    <div class="tabla-comparacion">
      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Valor Ingresado</th>
            <th>Valor Esperado</th>
            <th>Diferencia</th>
            <th>Acción</th>

            
            
          </tr>
        </thead>
        <tbody id="resultadosValidacionW08"></tbody>
      </table>
    </div>
  `;

// Genera boton para cambiar o mantener propuesta
Object.keys(codigosConocidos).forEach((codigo) => {
  const valorActual = valoresActuales[codigo] || 0;
  const valorEsperado = codigosConocidos[codigo];
  const diferencia = valorActual - valorEsperado;

  const tr = document.createElement("tr");
  if (diferencia !== 0) {
      tr.classList.add("diferencia-encontrada");
      tr.innerHTML = `
          <td>${codigo}</td>
          <td>${formatNumber(valorActual)}</td>
          <td>${formatNumber(valorEsperado)}</td>
          <td>${formatNumber(diferencia)}</td>
           
           
          
          <td>
              <div class="action-buttons">
                  <button class="accept-value-btn" data-codigo="${codigo}" data-valor="${valorEsperado}">
                      Aceptar valor SII
                  </button>
                  <button class="maintain-value-btn" data-codigo="${codigo}" data-valor="${valorActual}">
                      Mantener valor ingresado
                  </button>
              </div>
          </td>
      `;
  // Add event listeners for the buttons
  const acceptBtn = tr.querySelector('.accept-value-btn');
  const maintainBtn = tr.querySelector('.maintain-value-btn');

  acceptBtn.addEventListener('click', function() {
      const input = document.querySelector(`input[data-codigo="${codigo}"]`);
      if (input) {
          input.value = valorEsperado;
          calcularTotal538();
          tr.classList.remove('diferencia-encontrada');
          this.disabled = true;
          maintainBtn.disabled = true;
          this.textContent = 'Valor SII aplicado';
      }
  });

  maintainBtn.addEventListener('click', function() {
      this.disabled = true;
      acceptBtn.disabled = true;
      this.textContent = 'Valor mantenido';
  });

} else {
  tr.innerHTML = `
      <td>${codigo}</td>
      <td>${formatNumber(valorActual)}</td>
      <td>${formatNumber(valorEsperado)}</td>
      <td>${formatNumber(diferencia)}</td>
      <td></td>
  `;
}
tbody.appendChild(tr);
});

    if (hayDiferencias) {
      // Show popup only if there are differences
      setTimeout(() => {
        popup.style.display = "block";
      }, 3200);
    } else {
      // If no differences, show success message but stay on page
      setTimeout(() => {
        const successDiv = document.createElement("div");
        successDiv.className = "success-message";
        successDiv.textContent = "Puede proceder al Envio y  pago del F29";
        document.body.appendChild(successDiv);

        // Remove success message after 3 seconds
        setTimeout(() => {
          successDiv.remove();
        }, 3000);
      }, 3200);
    }

    // Inside the validarCodigos function, after populating the W08 discriminante
    // Add this code to populate the W08 results table:

    const w08Codigos = ["520", "525", "762", "766"];
    const tbodyW08 = document.getElementById("resultadosValidacionW08");
    tbodyW08.innerHTML = "";

    // Show all codes from codigosConocidos that are related to W08
    const w08AllCodigos = Object.keys(codigosConocidos).filter(codigo => 
      ['520', '525', '762', '766'].includes(codigo)
    );

    w08AllCodigos.forEach((codigo) => {
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
        ${diferencia !== 0 ? `
        <td>
          <div class="action-buttons">
            <button class="accept-value-btn" data-codigo="${codigo}" data-valor="${valorEsperado}">
              Aceptar valor SII
            </button>
            <button class="maintain-value-btn" data-codigo="${codigo}" data-valor="${valorActual}">
              Mantener valor ingresado
            </button>
          </div>
        </td>` : `<td></td>`}
      `;

      // Add event listeners for the buttons
      const acceptBtn = tr.querySelector('.accept-value-btn');
      const maintainBtn = tr.querySelector('.maintain-value-btn');

      if (acceptBtn && maintainBtn) {
        acceptBtn.addEventListener('click', function() {
          const input = document.querySelector(`input[data-codigo="${codigo}"]`);
          if (input) {
            input.value = valorEsperado;
            calcularTotal538();
            tr.classList.remove('diferencia-encontrada');
            this.disabled = true;
            maintainBtn.disabled = true;
            this.textContent = 'Valor SII aplicado';
          }
        });

        maintainBtn.addEventListener('click', function() {
          this.disabled = true;
          acceptBtn.disabled = true;
          this.textContent = 'Valor mantenido';
        });
      }

      tbodyW08.appendChild(tr);
    });
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
      520: 0,
      762: 0,
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
    var total91 = codigos["538"] - codigos["520"] - codigos["762"];
    codigos["91"] = total91;
    document.getElementById("total-monto-91").value = total91;
  }

  function ingresarPropuesta() {
    inputs.forEach((input) => {
      const codigo = input.getAttribute("data-codigo");
      if (codigo && codigo in codigosConocidos) {
        input.value = codigosConocidos[codigo];
      }
    });

    // Enable validate button after populating values
    if (validarBtn) {
      validarBtn.disabled = false;
    }
  }

  // Add event listener for the button
  if (ingresarPropuestaBtn) {
    ingresarPropuestaBtn.addEventListener("click", function () {
      ingresarPropuesta();
      calcularTotal538(); // Recalculate totals after populating values
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

/*barra de boton validaciones*/
// Add this to your existing script.js
document.querySelectorAll(".sidebar-btn").forEach((button) => {
  button.addEventListener("click", () => {
    // Remove active class from all buttons and pages
    document
      .querySelectorAll(".sidebar-btn")
      .forEach((btn) => btn.classList.remove("active"));
    document
      .querySelectorAll(".popup-page")
      .forEach((page) => page.classList.remove("active"));

    // Add active class to clicked button
    button.classList.add("active");

    // Show corresponding page
    const pageId = `page-${button.dataset.page}`;
    document.getElementById(pageId).classList.add("active");
  });
});

//boton esconde tootltip

document
  .getElementById("tooltipToggle")
  .addEventListener("change", function () {
    const statusText = document.getElementById("tooltipStatus");
    document.body.classList.toggle("hide-tooltips");

    if (this.checked) {
      statusText.textContent = "Activado";
    } else {
      statusText.textContent = "Desactivado";
    }
  });
