const tbody = document.querySelector("#historial tbody");

fetch("http://localhost:3000/api/historial")
  .then((response) => response.json())
  .then((data) => {
    // Crear una fila y celdas para cada propiedad del objeto JSON
    data.forEach((obj, index) => {
      // Verificar si el objeto tiene al menos una propiedad adicional
      if (Object.keys(obj).length > 1) {
        const row = document.createElement("tr");
        Object.entries(obj).forEach(([key, value]) => {
          const cell = document.createElement("td");
          cell.textContent = value;
          cell.setAttribute("data-key", key);
          cell.classList.add("user-data");
          cell.setAttribute("data-id", key);
          row.appendChild(cell);
        });
        const cellAccion = document.createElement("td");

        // Crear los botones dentro del ciclo forEach
        const btnAccion1 = document.createElement("button");
        btnAccion1.setAttribute("data-action", "action1");
        btnAccion1.classList.add("btn-accion");
        const iconAccion1 = document.createElement("i");
        iconAccion1.classList.add("fa-solid", "fa-trash");
        btnAccion1.appendChild(iconAccion1);


        cellAccion.appendChild(btnAccion1);
        row.appendChild(cellAccion);
        tbody.appendChild(row);

        // Agregar controladores de eventos a los botones de acción
        btnAccion1.addEventListener("click", () => {
          performAction("action1", obj, row);
        });
      }
    });

    // Función para realizar acciones basadas en la acción seleccionada
    function performAction(action, obj, row) {
      console.log("Realizando acción:", action);
      if (action === "action1") {
        // Mostrar una alerta de SweetAlert antes de eliminar el registro
        Swal.fire({
          title: '¿Estás seguro de que deseas eliminar este registro?',
          text: 'Este registro se eliminará y no se podrá recuperar.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, eliminar',
          cancelButtonText: 'Cancelar',
        }).then((result) => {
          if (result.isConfirmed) {
            // Eliminar el registro correspondiente del servidor
            fetch(`http://localhost:3000/api/historial/${obj.id}`, {
              method: "DELETE",
            })
              .then((response) => {
                if (response.status === 204) {
                  // Eliminar la fila correspondiente de la tabla
                  row.remove();
                } else {
                  console.log("Error al eliminar el registro");
                }
              })
              .catch((error) => {
                console.log(error);
              });
          }
        });
      }
    }
  });