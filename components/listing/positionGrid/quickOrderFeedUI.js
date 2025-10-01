export const headerDIV =`  <div className="grid grid-cols-[minmax(140px,1fr)_repeat(4,minmax(50px,auto))] bg-gray-100 text-gray-700 font-medium text-[11px] border-b border-gray-300">
                      <div
                        className="py-[1px] px-1 cursor-pointer truncate"
                        onClick={() => handleSort("symbol")}
                      >
                        Inst{getSortIndicator("symbol")}
                      </div>
                      <div className="py-[1px] px-1">Cancel</div>
                      <div
                        className="py-[1px] px-1 cursor-pointer"
                        onClick={() => handleSort("qty")}
                      >
                        Qty{getSortIndicator("qty")}
                      </div>
                      <div
                        className="py-[1px] px-1 cursor-pointer"
                        onClick={() => handleSort("limitPrice")}
                      >
                        Avg{getSortIndicator("limitPrice")}
                      </div>
                      <div
                        className="py-[1px] px-1 cursor-pointer"
                        onClick={() => handleSort("lp")}
                      >
                        LTP{getSortIndicator("lp")}
                      </div>
                    </div>`;

