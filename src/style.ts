import { css } from "lit";

export const styles = css`
  :host {
    --size-circle-entity: 79.99px;
    --mdc-icon-size: 24px;
    --clickable-cursor: pointer;
    --individual-left-bottom-color: #d0cc5b;
    --individual-left-top-color: #964cb5;
    --individual-right-top-color: #b54c9d;
    --individual-right-bottom-color: #5bd0cc;
    --non-fossil-color: var(--energy-non-fossil-color, #0f9d58);
    --icon-non-fossil-color: var(--non-fossil-color, #0f9d58);
    --charger-color: var(--energy-battery-in-color, #f06292);
    --icon-charger-color: var(--charger-color, #f06292);
    --text-charger-color: var(--primary-text-color);
    --secondary-text-charger-color: var(--primary-text-color);
    --icon-solar-color: var(--energy-solar-color, #ff9800);
    --icon-individual-bottom-color: var(--individual-left-bottom-color, #d0cc5b);
    --icon-individual-top-color: var(--individual-left-top-color, #964cb5);
    --icon-grid-color: var(--energy-grid-consumption-color, #488fc2);
    --icon-battery-color: var(--energy-battery-in-color, #f06292);
    --icon-home-color: var(--energy-grid-consumption-color, #488fc2);
    --text-solar-color: var(--primary-text-color);
    --text-non-fossil-color: var(--primary-text-color);
    --text-individual-bottom-color: var(--primary-text-color);
    --text-individual-top-color: var(--primary-text-color);
    --text-home-color: var(--primary-text-color);
    --secondary-text-individual-bottom-color: var(--primary-text-color);
    --secondary-text-individual-top-color: var(--primary-text-color);
    --text-battery-state-of-charge-color: var(--primary-text-color);
    --cirlce-grid-color: var(--energy-grid-consumption-color, #488fc2);
    --circle-battery-color: var(--energy-battery-in-color, #f06292);
    --battery-grid-line: var(--energy-grid-return-color, #8353d1);
    --secondary-text-solar-color: var(--primary-text-color);
    --secondary-text-grid-color: var(--primary-text-color);
    --secondary-text-home-color: var(--primary-text-color);
    --secondary-text-non-fossil-color: var(--primary-text-color);
    --lines-svg-not-flat-line-height: 106%;
    --lines-svg-not-flat-line-top: -2%;
    --lines-svg-flat-width: calc(100% - 160px);
    --lines-svg-not-flat-width: calc(103% - 165px);
    --lines-svg-not-flat-multi-indiv-height: 104%;
    --lines-svg-not-flat-multi-indiv-width: calc(103% - var(--size-circle-entity) * 3.7);
    --lines-svg-not-flat-multi-indiv-width: calc(((106% - 165px) * 0.5));
    --lines-svg-not-flat-multi-indiv-width: calc(((130% - 246px) * 0.5));
    --lines-svg-not-flat-multi-indiv-right-indiv-width: calc(((130% - 210px) * 0.5));
    --lines-svg-not-flat-multi-indiv-right-indiv-height: 103%;
    --lines-svg-flat-multi-indiv-width: calc((129% - 242px) * 0.5);
    --lines-svg-flat-left: 0;
    --lines-svg-not-flat-left: 0;
    --dot-size: 3.5px;

    --transparency: var(--transparency-unused-lines);
    --greyed-out--line-color: #bdbdbd;
    --text-grid-consumption-color: var(--energy-grid-consumption-color);
    --text-grid-return-color: var(--energy-grid-return-color);
    --text-battery-in-color: var(--energy-battery-in-color);
    --text-battery-out-color: var(--energy-battery-out-color);
    --home-circle-animation: rotate-in 0.6s ease-in;
  }

  ha-card {
    overflow: hidden;
  }

  ha-card.full-size {
    height: 100%;
  }

  .card-content.full-size {
    transform: scale(2) translateY(30%);
  }

  .card-content {
    position: relative;
    margin: 0 auto;
  }

  .circle {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    box-sizing: border-box;
    border: 2px solid;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-size: 12px;
    line-height: 12px;
    position: relative;
    text-decoration: none;
    color: var(--primary-text-color);
    gap: 2px;
    /* Opaque so the flow lines that run underneath end at the circle's edge
       instead of showing through it. This was previously disabled by a
       double-slash comment, which CSS does not support, so the declaration was
       silently dropped. */
    background-color: var(--card-background-color, var(--ha-card-background, var(--primary-background-color)));
    overflow: hidden;
  }

  .circle > ha-ripple {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
  }

  .circle > :not(ha-ripple) {
    position: relative;
    z-index: 1;
  }

  .card-content,
  .row {
    max-width: none;
  }
  .lines {
    position: absolute;
    bottom: 0;
    left: var(--size-circle-entity);
    width: 100%;
    height: 146px;
    display: flex;
    justify-content: flex-start;
    /*
     * Upstream pads this box by 16px on the sides and bottom, which is exactly
     * what makes the flow lines stop short of the circles and ride 16px above
     * their centres. Without the padding the lines meet the circle edges and sit
     * on the centre line. This is a deliberate deviation from the original card.
     */
    padding: 0;
    box-sizing: border-box;
    pointer-events: none;
    z-index: 0;
  }

  :dir(rtl) .lines {
    justify-content: flex-end;
  }

  .lines:not(.multi-individual) svg.flat-line {
    left: var(--lines-svg-flat-left);
  }

  .lines:not(.multi-individual) svg:not(.flat-line) {
    left: var(--lines-svg-not-flat-left);
  }

  .lines:has(svg:not(.flat-line)) {
    margin-left: -1%;
  }
  .lines.individual-bottom-individual-top {
    bottom: 110px;
  }
  .lines.high {
    /* 92 instead of 100: compensates the removed 16px bottom padding so the
       horizontal lines sit on the circle centres rather than above them. */
    bottom: 92px;
    height: 156px;
  }
  .lines svg {
    width: var(--lines-svg-flat-width);
    height: 100%;
    position: relative;
  }

  .lines svg:not(.flat-line) {
    width: var(--lines-svg-not-flat-width);
    height: var(--lines-svg-not-flat-line-height);
    top: var(--lines-svg-not-flat-line-top);
  }

  .multi-individual {
    left: calc(var(--size-circle-entity) + 2%);
    margin-left: -2.2% !important;
  }

  .multi-individual svg {
    width: var(--lines-svg-flat-multi-indiv-width);
  }

  .multi-individual svg:not(.flat-line) {
    width: var(--lines-svg-not-flat-multi-indiv-width);
    margin-top: 1px;
    height: var(--lines-svg-not-flat-multi-indiv-height);
  }

  .row {
    display: flex;
    justify-content: space-between;
    margin: 0 auto;
  }
  .circle-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    /*
     * The line overlay is rendered after the rows, so without an explicit
     * stacking order it paints on top of the circles and the flow lines run
     * straight through them.
     */
    position: relative;
    z-index: 1;
  }
  .circle-container.solar {
    height: 130px;
  }
  .circle-container.individual-top {
    height: 130px;
  }
  .circle-container.individual-bottom {
    justify-content: flex-end;
  }
  .circle-container.individual-bottom.bottom {
    position: relative;
    top: -20px;
    margin-bottom: -20px;
  }
  .circle-container.battery {
    height: 110px;
    justify-content: flex-end;
  }
  .spacer {
    width: var(--size-circle-entity);
  }

  .circle-container .circle {
    cursor: var(--clickable-cursor);
  }
  #battery-grid {
    stroke: var(--battery-grid-line);
  }
  ha-icon {
    display: inline;
    padding-bottom: 2px;
  }
  ha-icon.small {
    --mdc-icon-size: 12px;
  }
  .label {
    color: var(--secondary-text-color);
    font-size: 12px;
    max-width: 80px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    min-height: 20px;
  }
  .card-content.no-labels .label {
    display: none;
  }

  .card-content.no-labels .circle-container.solar,
  .card-content.no-labels .circle-container.low-carbon,
  .card-content.no-labels .circle-container.individual-top {
    height: 110px !important;
  }

  .card-content.no-labels .right-individual-flow-container,
  .card-content.no-labels .lines {
    transform: translateY(20px);
  }

  line,
  path {
    stroke: var(--disabled-text-color);
    stroke-width: 1;
    fill: none;
  }
  path.transparency {
    opacity: calc(calc(100 - var(--transparency)) / 100);
  }
  path.grey {
    stroke: var(--greyed-out--line-color) !important;
  }
  .circle svg {
    position: absolute;
    fill: none;
    stroke-width: 4px;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }

  span.secondary-info {
    color: var(--primary-text-color);
    font-size: 12px;
    max-width: 60px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  .individual-top path,
  .individual-top circle {
    stroke: var(--individual-left-top-color);
  }

  #individual-left-bottom-icon {
    color: var(--icon-individual-left-bottom-color);
  }
  #individual-left-top-icon {
    color: var(--icon-individual-left-top-color);
  }

  #individual-right-bottom-icon {
    color: var(--icon-individual-right-bottom-color);
  }
  #individual-right-top-icon {
    color: var(--icon-individual-right-top-color);
  }

  #solar-icon {
    color: var(--icon-solar-color);
  }
  circle.individual-top {
    stroke-width: 4;
    width: var(--dot-size);
    fill: var(--individual-left-top-color);
  }
  circle.individual-bottom {
    stroke-width: 4;
    width: var(--dot-size);
    fill: var(--individual-left-bottom-color);
  }
  .individual-top .circle {
    border-color: var(--individual-left-top-color);
  }
  .individual-bottom path,
  .individual-bottom circle {
    stroke: var(--individual-left-bottom-color);
  }
  .individual-bottom .circle {
    border-color: var(--individual-left-bottom-color);
  }

  .individual-right-top .circle {
    border-color: var(--individual-right-top-color);
  }

  circle.individual-right-top .circle {
    fill: var(--individual-right-top-color);
  }

  .individual-right-top path,
  .individual-right-top circle {
    stroke: var(--individual-right-top-color);
  }
  .individual-right-bottom .circle {
    border-color: var(--individual-right-bottom-color);
  }

  circle.individual-right-bottom .circle {
    fill: var(--individual-right-bottom-color);
  }

  .individual-right-bottom path,
  .individual-right-bottom circle {
    stroke: var(--individual-right-bottom-color);
  }

  .right-individual-flow-container {
    position: absolute;
    right: calc(var(--size-circle-entity) - 27% * 1.1 + 6px);
    width: 100%;
    display: flex;
    justify-content: flex-end;
    height: 156px;
    bottom: 100px;
    padding: 0 16px 16px;
    margin-right: -1.2%;
    box-sizing: border-box;
    pointer-events: none;
  }
  .right-individual-flow-container > svg {
    width: var(--lines-svg-not-flat-multi-indiv-right-indiv-width);
  }

  .right-individual-flow {
    height: var(--lines-svg-not-flat-multi-indiv-right-indiv-height);
    margin-top: 2px;
    width: var(--lines-svg-not-flat-multi-indiv-width);
    top: var(--lines-svg-not-flat-line-top);
    position: relative;
  }
  .circle-container.low-carbon {
    height: 130px;
  }
  .low-carbon path {
    stroke: var(--non-fossil-color);
  }
  .low-carbon .circle {
    border-color: var(--non-fossil-color);
  }
  .low-carbon ha-icon:not(.small) {
    color: var(--icon-non-fossil-color);
  }
  circle.low-carbon {
    stroke-width: 4;
    fill: var(--non-fossil-color);
    stroke: var(--non-fossil-color);
  }
  .circle-container.charger {
    height: 110px;
    justify-content: flex-end;
  }
  #charger-battery {
    stroke: var(--charger-color);
  }
  .charger path {
    stroke: var(--charger-color);
  }
  .charger .circle {
    border-color: var(--charger-color);
  }
  .charger ha-icon:not(.small) {
    color: var(--icon-charger-color);
  }
  circle.charger-to-battery {
    stroke-width: 4;
    fill: var(--charger-color);
    stroke: var(--charger-color);
  }
  .solar {
    color: var(--primary-text-color);
  }
  .solar .circle {
    border-color: var(--energy-solar-color);
  }
  .solar ha-icon:not(.small) {
    color: var(--icon-solar-color);
  }
  circle.solar,
  path.solar {
    stroke: var(--energy-solar-color);
  }
  circle.solar {
    stroke-width: 4;
    fill: var(--energy-solar-color);
  }
  .battery .circle {
    border-color: var(--circle-battery-color);
  }
  circle.battery,
  path.battery {
    stroke: var(--energy-battery-out-color);
  }
  path.battery-home,
  circle.battery-home {
    stroke: var(--energy-battery-out-color);
  }
  circle.battery-home {
    stroke-width: 4;
    fill: var(--energy-battery-out-color);
  }
  path.battery-solar,
  circle.battery-solar {
    stroke: var(--energy-battery-in-color);
  }
  circle.battery-solar {
    stroke-width: 4;
    fill: var(--energy-battery-in-color);
  }
  .battery-in {
    color: var(--energy-battery-in-color);
  }
  .battery-out {
    color: var(--energy-battery-out-color);
  }
  span.battery-in {
    color: var(--text-battery-in-color);
  }
  span.battery-out {
    color: var(--text-battery-out-color);
  }
  path.battery-from-grid {
    stroke: var(--energy-grid-consumption-color);
  }
  path.battery-to-grid {
    stroke: var(--battery-grid-line);
  }
  .battery ha-icon:not(.small) {
    color: var(--icon-battery-color);
  }

  path.return,
  circle.return,
  circle.battery-to-grid {
    stroke: var(--energy-grid-return-color);
  }
  circle.return,
  circle.battery-to-grid {
    stroke-width: 4;
    fill: var(--energy-grid-return-color);
  }
  .return {
    color: var(--energy-grid-return-color);
  }
  span.return {
    color: var(--text-grid-return-color);
  }
  .grid .circle {
    border-color: var(--circle-grid-color);
  }
  .consumption {
    color: var(--energy-grid-consumption-color);
  }
  span.consumption {
    color: var(--text-grid-consumption-color);
  }
  circle.grid,
  circle.battery-from-grid,
  path.grid {
    stroke: var(--energy-grid-consumption-color);
  }
  circle.grid,
  circle.battery-from-grid {
    stroke-width: 4;
    fill: var(--energy-grid-consumption-color);
  }
  .grid ha-icon:not(.small) {
    color: var(--icon-grid-color);
  }
  .home .circle {
    border-width: 0;
    border-color: var(--primary-color);
  }
  .home .circle.border {
    border-width: 2px;
  }
  .home ha-icon:not(.small) {
    color: var(--icon-home-color);
  }
  .circle svg circle {
    animation: var(--home-circle-animation);
    transition:
      stroke-dashoffset 0.4s,
      stroke-dasharray 0.4s;
    fill: none;
  }
  span.solar {
    color: var(--text-solar-color);
  }

  span.low-carbon {
    color: var(--text-non-fossil-color);
  }

  span.low-carbon.secondary-info {
    color: var(--secondary-text-non-fossil-color);
  }

  #home-circle {
    color: var(--text-home-color);
    z-index: 2;
  }

  .individual-bottom .circle {
    color: var(--text-individual-bottom-color);
  }

  .individual-top .circle {
    color: var(--text-individual-top-color);
  }

  .individual-bottom span.secondary-info {
    color: var(--secondary-text-individual-bottom-color);
  }

  .individual-top span.secondary-info {
    color: var(--secondary-text-individual-top-color);
  }

  span.secondary-info.left-top {
    color: var(--secondary-text-individual-left-top-color);
  }
  span.individual-left-top {
    color: var(--text-individual-left-top-color);
  }
  span.secondary-info.left-bottom {
    color: var(--secondary-text-individual-left-bottom-color);
  }
  span.individual-left-bottom {
    color: var(--text-individual-left-bottom-color);
  }
  span.secondary-info.right-top {
    color: var(--secondary-text-individual-right-top-color);
  }
  span.individual-right-top {
    color: var(--text-individual-right-top-color);
  }

  span.secondary-info.right-bottom {
    color: var(--secondary-text-individual-right-bottom-color);
  }
  span.individual-right-bottom {
    color: var(--text-individual-right-bottom-color);
  }

  .solar span.secondary-info {
    color: var(--secondary-text-solar-color);
  }

  .grid span.secondary-info {
    color: var(--secondary-text-grid-color);
  }

  .home span.secondary-info {
    color: var(--secondary-text-home-color);
  }

  #battery-state-of-charge-text {
    color: var(--text-battery-state-of-charge-color);
  }

  @keyframes rotate-in {
    from {
      stroke-dashoffset: 238.76104;
      stroke-dasharray: 238.76104;
    }
  }

  .card-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card-actions a {
    text-decoration: none;
  }

  .home-circle-sections {
    pointer-events: none;
  }

  .pointer-events-none {
    pointer-events: none;
  }

  /* ---- Docked breakdown lists (multi PV / multi battery / extra individuals) ---- */
  .pfcp-sub-energy {
    display: inline-flex;
    align-items: center;
    gap: 1px;
    font-size: 11px;
    color: var(--secondary-text-color);
    white-space: nowrap;
  }

  .pfcp-sub-energy-icon {
    --mdc-icon-size: 12px;
    width: 12px;
    height: 12px;
  }

  /* Watt / kWh switch in the card header. */
  /* Sits in the empty corner of the diagram rather than on a row of its own, so
     it costs no height and leaves the circle layout untouched. */
  .pfcp-energy-toggle {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .pfcp-energy-option {
    font: inherit;
    font-size: 12px;
    line-height: 1;
    padding: 4px 10px;
    border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
    background: none;
    color: var(--secondary-text-color);
    cursor: var(--clickable-cursor);
    border-radius: 12px;
  }

  .pfcp-energy-option.active {
    background-color: var(--primary-color);
    border-color: var(--primary-color);
    color: var(--text-primary-color, #fff);
  }

  .pfcp-energy-period {
    font-size: 11px;
    color: var(--secondary-text-color);
  }

  /*
   * Diagram plus the optional device rail beside it. Without a rail the layout is
   * a single column and behaves exactly as before.
   */
  .pfcp-layout {
    display: flex;
    align-items: flex-start;
    gap: 16px;
  }

  /* Without this the flex item shrinks to its content and the circles end up
     squeezed together on the left instead of using the full card width. */
  .pfcp-flow {
    flex: 1 1 0;
    min-width: 0;
  }

  .card-content.has-side-zone {
    /* The diagram keeps its own width; a side zone uses the space next to it, so
       the content must be allowed to grow past the usual cap. Lifting the cap also
       removes the centring that used to keep the content off the card edge, hence
       the explicit inset. */
    max-width: none;
    padding-right: 16px;
    box-sizing: border-box;
  }

  .card-content.has-side-zone .pfcp-flow {
    flex: 0 0 470px;
    max-width: 470px;
  }

  /* The rail is a column, so the 160px flex-basis of a group would become its
     minimum height and leave a tall empty gap below short lists. */
  .pfcp-zone-left .pfcp-subs,
  .pfcp-zone-right .pfcp-subs {
    flex: 0 0 auto;
    min-width: 0;
  }

  /* A side zone is narrow, so its entries always stack one per row. Both classes
     are needed to outrank the general breakdown rule further down, which would
     otherwise force its 290px minimum into a much narrower column. */
  .pfcp-breakdown.pfcp-zone-left .pfcp-subs-items,
  .pfcp-breakdown.pfcp-zone-right .pfcp-subs-items {
    grid-template-columns: minmax(0, 1fr);
  }

  /* Narrow cards: the rail drops below the diagram instead of squeezing it. */
  @media (max-width: 660px) {
    .pfcp-layout {
      flex-wrap: wrap;
    }
    .card-content.has-side-zone .pfcp-flow {
      flex: 1 1 100%;
      margin: 0 auto;
    }
  }

  /*
   * Dedicated container for the charging-source line. Spans the gap between the
   * charger circle and the battery circle inside the battery row. The shared
   * .lines overlay cannot be used here: it sits above this row and clips its
   * contents to a narrow band.
   */
  .pfcp-charger-lines {
    position: absolute;
    /* Vertically centred on the battery row's circles. */
    bottom: 50px;
    /* From the charger circle's right edge to the battery circle's centre. The
       battery node is always horizontally centred, hence the 50%. */
    left: var(--size-circle-entity);
    width: calc(50% - var(--size-circle-entity));
    height: 20px;
    pointer-events: none;
    z-index: 0;
  }

  .pfcp-charger-lines svg {
    width: 100%;
    height: 100%;
    overflow: visible;
  }

  /*
   * Positioning context for the flow diagram. Without it the flow lines anchor to
   * .card-content, and the breakdown list below them shifts every line down by its
   * own height.
   */
  .pfcp-flow {
    position: relative;
  }

  /* Above the diagram the separator belongs on the other side, so the block reads
     as belonging to what sits below it. */
  .pfcp-breakdown.pfcp-zone-top {
    margin-top: 0;
    margin-bottom: 12px;
    padding-top: 0;
    padding-bottom: 12px;
    border-top: none;
    border-bottom: 1px solid var(--divider-color, rgba(127, 127, 127, 0.2));
  }

  /* Side zones sit next to the diagram, so they carry no horizontal rule at all
     and stack their groups vertically. */
  /* Both classes again, so this outranks the general breakdown rule further down
     that would otherwise draw a horizontal rule above a side zone. */
  .pfcp-breakdown.pfcp-zone-left,
  .pfcp-breakdown.pfcp-zone-right {
    flex: 1 1 200px;
    min-width: 150px;
    margin-top: 0;
    padding-top: 8px;
    border-top: none;
    flex-direction: column;
    gap: 12px;
  }

  .pfcp-breakdown {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 16px;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--divider-color, rgba(127, 127, 127, 0.2));
  }

  .pfcp-subs {
    flex: 1 1 160px;
    min-width: 150px;
    --pfcp-sub-color: var(--primary-text-color);
  }

  .pfcp-subs-solar {
    --pfcp-sub-color: var(--icon-solar-color, #ff9800);
  }

  .pfcp-subs-battery {
    --pfcp-sub-color: var(--icon-battery-color, #f06292);
  }

  .pfcp-subs-individual {
    --pfcp-sub-color: var(--icon-individual-top-color, #964cb5);
  }

  .pfcp-subs-title {
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    opacity: 0.7;
    color: var(--secondary-text-color, var(--primary-text-color));
    margin: 0 0 6px 2px;
  }

  .pfcp-subs-items {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  /* In the docked breakdown the entries are laid out two per row, so four
     batteries form a 2x2 block instead of one tall column. The side rail stays
     single-column — it is too narrow to split. */
  /* Two per row where there is room, one where there is not — a fixed two-column
     grid squeezed the names into an ellipsis as soon as two groups sat side by
     side. */
  .pfcp-breakdown .pfcp-subs-items {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
    gap: 4px 16px;
  }

  .pfcp-sub {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 8px;
    border-radius: 8px;
    cursor: var(--clickable-cursor);
    border-left: 3px solid var(--pfcp-sub-color);
    background: var(--ha-card-background, var(--card-background-color, rgba(127, 127, 127, 0.06)));
    transition: background-color 120ms ease-in-out;
  }

  .pfcp-sub:hover {
    background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
  }

  .pfcp-sub:focus-visible {
    outline: 2px solid var(--pfcp-sub-color);
    outline-offset: 1px;
  }

  .pfcp-sub-icon {
    color: var(--pfcp-sub-color);
    --mdc-icon-size: 18px;
    flex: 0 0 auto;
  }

  .pfcp-sub-name {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.85rem;
    color: var(--primary-text-color);
  }

  .pfcp-sub-values {
    flex: 0 0 auto;
    display: flex;
    align-items: baseline;
    gap: 6px;
    font-size: 0.85rem;
    font-variant-numeric: tabular-nums;
    color: var(--primary-text-color);
  }

  /* The state of charge is the headline number of a battery row, so it is the
     largest thing in it rather than the smallest. It borrows the row's accent
     colour, which carries the charge level itself when color_battery_by_soc is
     on, and falls back to the normal text colour otherwise. */
  .pfcp-sub-soc {
    font-size: 1.05rem;
    font-weight: 600;
    line-height: 1;
    color: var(--pfcp-sub-color, var(--primary-text-color));
    margin-right: 2px;
  }

  /* ===================================================================
     Mushroom appearance  (config: appearance: mushroom)
     Filled shapes instead of outlined rings, Mushroom typography,
     softer flow lines and a chip-styled breakdown list.
     =================================================================== */
  .card-content.appearance-mushroom {
    --pfcp-shape-strength: 20%;
    --pfcp-shape-radius: var(--mush-icon-border-radius, 50%);
    --pfcp-shape-fallback: var(--primary-color, #03a9f4);
  }

  .card-content.appearance-mushroom .circle {
    border-color: transparent;
    /* Tint layered over an opaque base, so the shape keeps its translucent look
       without the flow lines showing through it. */
    background-color: var(--card-background-color, var(--ha-card-background, var(--primary-background-color)));
    background-image: linear-gradient(
      color-mix(in srgb, var(--pfcp-shape, var(--pfcp-shape-fallback)) var(--pfcp-shape-strength), transparent) 0 0
    );
    background-clip: padding-box;
    border-radius: var(--pfcp-shape-radius);
    font-size: 12px;
    font-weight: 500;
    line-height: 14px;
    gap: 1px;
  }

  .card-content.appearance-mushroom .circle > ha-ripple {
    border-radius: var(--pfcp-shape-radius);
  }

  .card-content.appearance-mushroom .circle span {
    font-weight: 500;
  }

  .card-content.appearance-mushroom span.secondary-info {
    font-size: 11px;
    font-weight: 400;
    opacity: 0.7;
  }

  .card-content.appearance-mushroom .label {
    font-size: 12px;
    font-weight: 500;
    line-height: 16px;
    color: var(--secondary-text-color);
  }

  /* Shape colour follows the icon colour of each node, the way Mushroom does it. */
  .card-content.appearance-mushroom .solar .circle {
    --pfcp-shape: var(--icon-solar-color, var(--energy-solar-color, #ff9800));
  }
  .card-content.appearance-mushroom .low-carbon .circle {
    --pfcp-shape: var(--icon-non-fossil-color, var(--non-fossil-color, #0f9d58));
  }
  .card-content.appearance-mushroom .grid .circle {
    --pfcp-shape: var(--icon-grid-color, var(--circle-grid-color, var(--energy-grid-consumption-color, #488fc2)));
  }
  .card-content.appearance-mushroom .battery .circle {
    --pfcp-shape: var(--icon-battery-color, var(--circle-battery-color, var(--energy-battery-in-color, #f06292)));
  }
  .card-content.appearance-mushroom .home .circle {
    --pfcp-shape: var(--icon-home-color, var(--energy-grid-consumption-color, #488fc2));
  }
  .card-content.appearance-mushroom .individual-top:not(.individual-right) .circle {
    --pfcp-shape: var(--icon-individual-left-top-color, var(--individual-left-top-color, #964cb5));
  }
  .card-content.appearance-mushroom .individual-bottom:not(.individual-right) .circle {
    --pfcp-shape: var(--icon-individual-left-bottom-color, var(--individual-left-bottom-color, #d0cc5b));
  }
  .card-content.appearance-mushroom .individual-right-top .circle {
    --pfcp-shape: var(--icon-individual-right-top-color, var(--individual-right-top-color, #b54c9d));
  }
  .card-content.appearance-mushroom .individual-right-bottom .circle {
    --pfcp-shape: var(--icon-individual-right-bottom-color, var(--individual-right-bottom-color, #5bd0cc));
  }

  /* Softer flow lines. */
  .card-content.appearance-mushroom line,
  .card-content.appearance-mushroom path {
    stroke-width: 1.5;
    stroke-linecap: round;
  }

  /* Breakdown list rendered as Mushroom-style chips. */
  .card-content.appearance-mushroom .pfcp-breakdown {
    gap: 10px 14px;
    border-top-color: var(--divider-color, rgba(127, 127, 127, 0.12));
  }

  .card-content.appearance-mushroom .pfcp-subs-title {
    text-transform: none;
    letter-spacing: 0;
    font-size: 0.8rem;
    font-weight: 500;
    opacity: 0.6;
    margin-bottom: 8px;
  }

  .card-content.appearance-mushroom .pfcp-sub {
    border-left: none;
    border-radius: var(--ha-card-border-radius, 12px);
    padding: 6px 10px;
    gap: 10px;
    background: color-mix(in srgb, var(--pfcp-sub-color) 12%, transparent);
  }

  .card-content.appearance-mushroom .pfcp-sub:hover {
    background: color-mix(in srgb, var(--pfcp-sub-color) 22%, transparent);
  }

  .card-content.appearance-mushroom .pfcp-sub-icon {
    --mdc-icon-size: 16px;
    padding: 6px;
    border-radius: var(--pfcp-shape-radius);
    background: color-mix(in srgb, var(--pfcp-sub-color) var(--pfcp-shape-strength), transparent);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .card-content.appearance-mushroom .pfcp-sub-soc {
    font-size: 1.05rem;
    font-weight: 600;
  }

  .card-content.appearance-mushroom .pfcp-sub-name {
    font-size: 0.85rem;
    font-weight: 500;
  }

  .card-content.appearance-mushroom .pfcp-sub-values {
    font-weight: 500;
  }

`;
