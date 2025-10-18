document.addEventListener("DOMContentLoaded", () => {
  const uno = document.querySelector(".Navigation a:nth-child(1) .sphere");
  const polar = document.querySelectorAll(".Navigation a:nth-child(2) .sphere");
  const triad = document.querySelectorAll(".Navigation a:nth-child(3) .sphere");

  let t = 0;

  function animate() {
    t += 0.02;

    // === UNO === (flutuação suave)
    const floatY = Math.sin(t) * 10;
    uno.style.transform = `translateY(${floatY}px)`;

    // === POLARIDADE === (atração e repulsão)
    const distance = Math.sin(t * 1.5) * 12;
    polar[0].style.transform = `translateX(${-distance}px)`;
    polar[1].style.transform = `translateX(${distance}px)`;

    // === TRÍADE === (órbita equilibrada)
    const radius = 5 + Math.sin(t * 0.5) * 10; // raio reduzido e oscilação menor
    triad.forEach((sphere, i) => {
      const angle = t + (i * (Math.PI * 2 / 3)); // 120° de separação
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius * 0.9; // leve elipse para naturalidade
      sphere.style.transform = `translate(${x}px, ${y}px)`;
    });

    requestAnimationFrame(animate);
  }

  animate();
});
