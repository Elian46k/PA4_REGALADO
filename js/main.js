const barra = document.getElementById("barra");
const menu = document.getElementById("menu");
const form = document.getElementById("form");
const aviso = document.getElementById("aviso");
const live = document.getElementById("errores");
const carruselEl = document.getElementById("carrusel");
const btnPausa = document.getElementById("btn-pausa");
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function marcarFondo() {
  if (!barra) return;
  if (window.scrollY > 40 || (menu && menu.classList.contains("show"))) {
    barra.classList.add("fondo");
  } else {
    barra.classList.remove("fondo");
  }
}

window.addEventListener("scroll", marcarFondo, { passive: true });
marcarFondo();

if (menu) {
  menu.addEventListener("show.bs.collapse", function () {
    barra.classList.add("abierto");
    barra.classList.add("fondo");
  });
  menu.addEventListener("hidden.bs.collapse", function () {
    barra.classList.remove("abierto");
    marcarFondo();
  });
}

document.addEventListener("keydown", function (e) {
  if (e.key !== "Escape") return;
  if (menu && menu.classList.contains("show")) {
    const colapso = bootstrap.Collapse.getInstance(menu);
    if (colapso) colapso.hide();
    return;
  }
  const item = document.activeElement && document.activeElement.closest(".accordion-item");
  if (!item) return;
  const panel = item.querySelector(".accordion-collapse.show");
  const boton = item.querySelector(".accordion-button");
  if (!panel || !boton) return;
  const instancia = bootstrap.Collapse.getInstance(panel);
  if (instancia) instancia.hide();
  boton.focus();
});

if (carruselEl) {
  const carrusel = bootstrap.Carousel.getOrCreateInstance(carruselEl, {
    interval: 6500,
    ride: false,
    pause: false,
    wrap: true
  });
  let enMarcha = false;

  function iconoPausa(pausado) {
    if (!btnPausa) return;
    const icono = btnPausa.querySelector("i");
    if (pausado) {
      btnPausa.setAttribute("aria-pressed", "true");
      btnPausa.setAttribute("aria-label", "Reproducir presentación");
      if (icono) icono.className = "bi bi-play-fill";
    } else {
      btnPausa.setAttribute("aria-pressed", "false");
      btnPausa.setAttribute("aria-label", "Pausar presentación");
      if (icono) icono.className = "bi bi-pause-fill";
    }
  }

  if (!reduce) {
    carrusel.cycle();
    enMarcha = true;
    iconoPausa(false);
  } else {
    carrusel.pause();
    enMarcha = false;
    iconoPausa(true);
  }

  if (btnPausa) {
    btnPausa.addEventListener("click", function () {
      if (enMarcha) {
        carrusel.pause();
        enMarcha = false;
        iconoPausa(true);
      } else {
        carrusel.cycle();
        enMarcha = true;
        iconoPausa(false);
      }
    });
  }
}

function validarCorreo(valor) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
}

function validarTelefono(valor) {
  const digitos = valor.replace(/\D/g, "");
  return digitos.length >= 6 && digitos.length <= 15;
}

function mostrarError(campo, texto) {
  campo.classList.add("is-invalid");
  campo.classList.remove("is-valid");
  campo.setAttribute("aria-invalid", "true");
  const caja = campo.closest(".campo").querySelector(".invalid-feedback");
  if (caja) caja.textContent = texto;
}

function limpiarError(campo) {
  campo.classList.remove("is-invalid");
  campo.removeAttribute("aria-invalid");
  const caja = campo.closest(".campo").querySelector(".invalid-feedback");
  if (caja) caja.textContent = "";
}

function abrirCarrera(id) {
  const btn = document.querySelector('[data-bs-target="#' + id + '"]');
  if (!btn) return;
  const tab = bootstrap.Tab.getOrCreateInstance(btn);
  tab.show();
}

const pestanias = document.getElementById("pestanias-carreras");
if (pestanias) {
  pestanias.addEventListener("shown.bs.tab", function (e) {
    const destino = e.target.getAttribute("data-bs-target");
    if (destino && destino.indexOf("#carrera-") === 0) {
      history.replaceState(null, "", destino);
    }
  });
  document.querySelectorAll(".ficha a[href*='#carrera-']").forEach(function (enlace) {
    enlace.addEventListener("click", function (e) {
      const id = enlace.hash.slice(1);
      if (!document.getElementById(id)) return;
      e.preventDefault();
      abrirCarrera(id);
      const zona = document.getElementById("carrera");
      if (zona) zona.scrollIntoView();
    });
  });
  const hash = location.hash.slice(1);
  if (hash.indexOf("carrera-") === 0) {
    abrirCarrera(hash);
    const zona = document.getElementById("carrera");
    if (zona) zona.scrollIntoView();
  }
  window.addEventListener("hashchange", function () {
    const id = location.hash.slice(1);
    if (id.indexOf("carrera-") === 0) abrirCarrera(id);
  });
}

if (form) {
  const params = new URLSearchParams(window.location.search);
  const selCarrera = document.getElementById("carrera");
  const selMotivo = document.getElementById("motivo");
  const qCarrera = params.get("carrera");
  const qMotivo = params.get("motivo");
  if (selCarrera && qCarrera && selCarrera.querySelector('option[value="' + qCarrera + '"]')) {
    selCarrera.value = qCarrera;
    if (selMotivo && !qMotivo) selMotivo.value = "consulta";
  }
  if (selMotivo && qMotivo && selMotivo.querySelector('option[value="' + qMotivo + '"]')) {
    selMotivo.value = qMotivo;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const nombre = document.getElementById("nombre");
    const correo = document.getElementById("correo");
    const telefono = document.getElementById("telefono");
    const modalidad = document.getElementById("modalidad");
    const motivo = document.getElementById("motivo");
    const carrera = document.getElementById("carrera");
    const mensaje = document.getElementById("mensaje");
    const datos = document.getElementById("datos");
    const campos = [nombre, correo, telefono, modalidad, motivo, carrera, mensaje, datos];
    let ok = true;
    const fallos = [];

    campos.forEach(limpiarError);
    if (aviso) aviso.classList.add("d-none");

    if (!nombre.value.trim()) {
      mostrarError(nombre, "Escribe tu nombre completo.");
      fallos.push("nombre");
      ok = false;
    }
    if (!validarCorreo(correo.value.trim())) {
      mostrarError(correo, "Ingresa un correo válido, por ejemplo nombre@gmail.com.");
      fallos.push("correo");
      ok = false;
    }
    if (!validarTelefono(telefono.value.trim())) {
      mostrarError(telefono, "Ingresa un teléfono con al menos 6 dígitos. Puedes usar el formato (043) 000-000.");
      fallos.push("teléfono");
      ok = false;
    }
    if (!modalidad.value) {
      mostrarError(modalidad, "Selecciona una modalidad.");
      fallos.push("modalidad");
      ok = false;
    }
    if (!motivo.value) {
      mostrarError(motivo, "Selecciona el motivo de tu mensaje.");
      fallos.push("motivo");
      ok = false;
    }
    if (!carrera.value) {
      mostrarError(carrera, "Selecciona una carrera de interés.");
      fallos.push("carrera");
      ok = false;
    }
    if (mensaje.value.trim().length < 10) {
      mostrarError(mensaje, "El mensaje debe tener al menos 10 caracteres.");
      fallos.push("mensaje");
      ok = false;
    }
    if (!datos.checked) {
      mostrarError(datos, "Marca la casilla para continuar.");
      fallos.push("tratamiento de datos");
      ok = false;
    }

    if (!ok) {
      if (live) live.textContent = "Hay " + fallos.length + " campos por corregir: " + fallos.join(", ") + ".";
      const primero = form.querySelector(".is-invalid");
      if (primero) primero.focus();
      return;
    }

    if (live) live.textContent = "";
    form.reset();
    campos.forEach(limpiarError);
    if (aviso) {
      aviso.classList.remove("d-none");
      aviso.focus();
    }
  });
}
