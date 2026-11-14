# Reto Original: NASA Space Apps Challenge

## Challenge Summary
Missions to the Moon’s south pole face extreme lighting and communication constraints, and planning them takes careful coordination between science and engineering teams. Tools for determining Sun and Earth positions at candidate landing sites exist, but their complicated interfaces make it difficult to evaluate critical information with efficiency. Your challenge is to create an intuitive tool or application that lets mission planners, educators, and the public compare landing sites and dates quickly, visualizing Sun and Earth positions relative to the horizon to assess power generation potential and direct-to-Earth communication windows.

---

## Background

NASA’s Commercial Lunar Payload Services (CLPS) program and other lunar missions depend on careful selection of landing sites and dates that balance the needs of both science and engineering teams. One of the most significant challenges in this process is understanding the local lighting and communication environment at a potential landing site. The position of the Sun determines power availability for solar arrays and thermal conditions for equipment, while the position of Earth determines whether direct communication is possible without relay satellites.

This challenge is particularly acute at the Moon's south pole, where many future missions are planned due to the presence of water ice and other scientifically valuable resources. The south pole's geometry creates extreme variations in solar illumination and Earth visibility across different lunar days and seasons. Small changes in landing location or date can dramatically affect both power generation potential and communication windows, making rapid site evaluation critical.

In practice, mission development rarely proceeds on a fixed timeline. Hardware development challenges, launch delays, or other factors often force mission planners to reconsider their original landing date and location. When this happens, engineers need to quickly evaluate alternative sites in the same region, or alternative dates at the same site, to understand how these changes impact mission feasibility. A tool that enables rapid, intuitive comparison of multiple scenarios would accelerate this decision-making process and help teams identify viable alternatives when constraints shift.

Tools that provide this information — such as NASA's Quickmap, Moon Trek, and the JPL Horizons System — are built for detailed analysis and are often difficult for non-specialists to use effectively for rapid scenario comparison. Evaluating each site-data combination means navigating multiple interfaces and interpreting raw data. This leaves a gap between the technical data available and the accessible tools needed to support agile mission planning. An intuitive interface that translates complex ephemeris and topographic data into clear, comparable visualizations could help bridge that gap.

---

## Objectives

Your challenge is to create a tool or application that enables rapid evaluation of lunar landing site options. Your solution may include:

- **Interactive site selection and comparison:** You may consider allowing users to choose from a curated list of notable landing sites – such as past Apollo missions, future CLPS mission targets, targets of other commercial lunar missions, or landing sites from other countries' lunar programs – as well as the ability to input custom lunar coordinates. You may also consider enabling side-by-side or sequential comparison of multiple sites to help users quickly assess trade-offs.
- **Date and time flexibility:** You may consider allowing users to select landing dates and times, and providing tools to explore how conditions change across different lunar days or seasons. This enables users to understand how mission schedule adjustments affect feasibility.
- **Sun and Earth position visualization:** Display the positions of the Sun and Earth relative to the horizon at a selected landing site on a chosen date. You may consider showing how much time remains before sunset or Earthset, as this directly impacts mission operations and power generation windows.
- **Power and communication assessment:** You may consider highlighting key metrics such as solar elevation angle (which affects power generation efficiency), duration of sunlight, and Earth visibility windows. These metrics help mission planners quickly assess whether a site-date combination is viable.
- **Multiple visualization approaches:** You may explore 2D maps, 3D surface visualizations, or other creative representations that help users understand the spatial relationships between the landing site, Sun, and Earth.
- **Temporal dynamics:** You may consider creating animations or timeline views that show how Sun and Earth positions change over a lunar day or across multiple days, helping users understand the duration and timing of operational windows.
- **Accessibility across skill levels:** Your tool could serve mission planners seeking detailed technical information for rapid decision-making, as well as educators and the general public curious about why the Moon presents such distinct engineering challenges.

You are encouraged to be creative in how you present this information. Your solution might be a web application, a mobile app, an interactive visualization, an educational game, or another format entirely — as long as it makes rapid site evaluation clear and efficient.

---

## Potential Considerations

You may (but are not required to) consider the following:

### Technical approach:
- **Ephemeris data:** The positions and motions of celestial bodies can be calculated using tools like the JPL Horizons System, or you may consider using pre-computed datasets.
- **Lunar topography data:** Sources like the Lunar Orbiter Laser Altimeter (LOLA) can help create realistic surface visualizations and accurate horizon calculations.
- **Vacuum conditions:** Consider how to handle the Moon's lack of atmosphere when calculating horizon positions. Without atmospheric refraction, the horizon is determined by local terrain and the edge of the lunar sphere as seen from the landing site.
- **Solar elevation angle:** A key metric for power generation, and you may consider calculating and displaying this prominently.

### User experience:
- Your interface could prioritize rapid scenario comparison, allowing mission planners to evaluate multiple site-date combinations efficiently.
- Consider how to clearly communicate time remaining before sunset or Earthset, as this is critical operational information.
- Think about how to make the extreme differences between lunar and terrestrial conditions apparent—they can be compelling when visualized effectively.
- You may consider features that help users understand why small location or date changes have large impacts on mission feasibility.

### Data and accuracy:
- Consider accounting for the Moon's actual topography, as terrain elevation can significantly affect horizon positions and visibility windows.
- Consider whether your tool will account for factors like Earth's libration (wobble) or the Moon's orbital variations.
- South pole terrain is particularly complex, and you may consider how to represent steep slopes and deep craters that create extreme shadow conditions.

### Engagement and impact:
- Your solution could support mission planners in coordinating between science and engineering teams during mission development.
- It could help teams respond quickly when schedule changes or hardware development challenges require landing date or location adjustments.
- It could also serve as an educational tool to help students and the public understand lunar exploration challenges and why mission planning is so complex.

---

## Evaluation Criteria (Official Rubric)

Each criterion accounts for 12.5% of the total score (100% total):

1. **Technological Innovation (12.5%):** Original technology, advanced techniques, and a functional solution that improves upon existing approaches.
2. **User Experience (UX/UI) (12.5%):** An intuitive, accessible, visually consistent, and easy-to-use functional prototype.
3. **Social Impact (12.5%):** A relevant problem, clear beneficiaries, realistic implementation, and potential for positive social change.
4. **Use of NASA Data (12.5%):** Meaningful integration, accurate interpretation, and effective communication of NASA or partner agency datasets.
5. **Scientific Solution (12.5%):** Scientific accuracy, relevance to the challenge, validation, and real-world feasibility.
6. **Creativity (12.5%):** An original approach that combines ideas, disciplines, or methods in innovative ways.
7. **Art & Technology (12.5%):** Effective integration of artistic elements with technology and science to enhance the solution.
8. **Communication (12.5%):** A clear and compelling presentation, complete English documentation, AI tool disclosure, and proper citations.
