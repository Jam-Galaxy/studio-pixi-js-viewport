
export function getSecondLabel(xSeconds: number, majorMarkStep: number, majorMarkStepPower: number) {
  return majorMarkStep >= 1 ? getRiskLabelByRiskTimeMISS(xSeconds) : getRiskLabelByRiskTimeMISSMS(xSeconds, majorMarkStepPower)
}

  /**
   * @param {*} riskTime seconds
   */
  function getRiskLabelByRiskTimeMISS(riskTime: number): string {
    //TODO: move from here
    riskTime *= 1000; //to milliseconds
    const absRiskTime = Math.abs(riskTime);
    const minutes = Math.floor(absRiskTime / (1000 * 60));
    const seconds = Math.floor((absRiskTime % (1000 * 60)) / 1000);
    // const milliseconds = Math.floor(absRiskTime % 1000);
    const sign = riskTime >= 0 ? "" : "-";
    return `${sign}${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }


    /**
   * @param {*} riskTime seconds
   * @param {*} majorMarkStepPower need to properly define the precision which should be printed
   */
  function getRiskLabelByRiskTimeMISSMS(riskTime: number, majorMarkStepPower = 0): string {
    //TODO: move from here
    riskTime *= 1000; //to milliseconds
    const absRiskTime = Math.round(Math.abs(riskTime));
    const minutes = Math.floor(absRiskTime / (1000 * 60));
    const seconds = Math.floor((absRiskTime % (1000 * 60)) / 1000);
    const milliseconds = Math.floor(absRiskTime % 1000);
    const sign = riskTime >= 0 ? "" : "-";

    return `${sign}${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${(milliseconds / 1000).toFixed(-majorMarkStepPower).substring(2) || "0"}`;
  }