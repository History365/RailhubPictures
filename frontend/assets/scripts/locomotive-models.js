                        function updateLocomotiveModels() {
                            const railroad = document.getElementById('railroad').value;
                            const modelSelect = document.getElementById('model');
    
                            modelSelect.innerHTML = '<option value="">Select Model</option>';
    
                            if (railroad === 'NS') {
                                const nsModels = [
                                    // ALCO
                                    { model: 'C-420', builder: 'ALCO' },
                                    { model: 'C-425', builder: 'ALCO' },
                                    { model: 'C-630', builder: 'ALCO' },
                                    { model: 'RS-36', builder: 'ALCO' },
                                    { model: 'RSD-12', builder: 'ALCO' },
                                    { model: 'T-6', builder: 'ALCO' },

                                    // ALCO/CR
                                    { model: 'MT-4 Slug', builder: 'ALCO/CR' },
                                    { model: 'MT-6 Slug', builder: 'ALCO/CR' },

                                    // ALCO/CR/NS
                                    { model: 'RPU6 Slug', builder: 'ALCO/CR/NS' },

                                    // ALCO/NW/NS
                                    { model: 'RPU6 Slug', builder: 'ALCO/NW/NS' },

                                    // ALCO/SOU
                                    { model: 'RP-A4U Slug', builder: 'ALCO/SOU' },

                                    // EMD
                                    { model: 'E8', builder: 'EMD' },
                                    { model: 'F-7B', builder: 'EMD' },
                                    { model: 'F-9A', builder: 'EMD' },
                                    { model: 'F40PH', builder: 'EMD' },
                                    { model: 'FP7', builder: 'EMD' },
                                    { model: 'GP15-1', builder: 'EMD' },
                                    { model: 'GP18', builder: 'EMD' },
                                    { model: 'GP30', builder: 'EMD' },
                                    { model: 'GP35', builder: 'EMD' },
                                    { model: 'GP38', builder: 'EMD' },
                                    { model: 'GP38AC', builder: 'EMD' },
                                    { model: 'GP40', builder: 'EMD' },
                                    { model: 'GP40-2', builder: 'EMD' },
                                    { model: 'GP4.5', builder: 'EMD' },
                                    { model: 'GP9', builder: 'EMD' },
                                    { model: 'GP9R', builder: 'EMD' },
                                    { model: 'MP15DC', builder: 'EMD' },
                                    { model: 'NW2', builder: 'EMD' },
                                    { model: 'RCP4', builder: 'EMD' },
                                    { model: 'SD35', builder: 'EMD' },
                                    { model: 'SD38', builder: 'EMD' },
                                    { model: 'SD38-2', builder: 'EMD' },
                                    { model: 'SD40-2', builder: 'EMD' },
                                    { model: 'SD45', builder: 'EMD' },
                                    { model: 'SD45-2', builder: 'EMD' },
                                    { model: 'SD7', builder: 'EMD' },
                                    { model: 'SD70', builder: 'EMD' },
                                    { model: 'SD70ACe', builder: 'EMD' },
                                    { model: 'SD70ACC', builder: 'EMD' },
                                    { model: 'SD70IAC', builder: 'EMD' },
                                    { model: 'SD70M', builder: 'EMD' },
                                    { model: 'SD70M-2', builder: 'EMD' },
                                    { model: 'SD75M', builder: 'EMD' },
                                    { model: 'SD9', builder: 'EMD' },
                                    { model: 'SW1', builder: 'EMD' },
                                    { model: 'SW1001', builder: 'EMD' },
                                    { model: 'SW1200', builder: 'EMD' },
                                    { model: 'SW1200m', builder: 'EMD' },
                                    { model: 'SW1500', builder: 'EMD' },
                                    { model: 'SW7', builder: 'EMD' },
                                    { model: 'SW8', builder: 'EMD' },
                                    { model: 'SW9', builder: 'EMD' },
                                    { model: 'TR2', builder: 'EMD' },

                                    // EMD/GE
                                    { model: 'RP-E4U Slug', builder: 'EMD/GE' },

                                    // EMD/NS
                                    { model: 'BP4', builder: 'EMD/NS' },
                                    { model: 'RCP4', builder: 'EMD/NS' },
                                    { model: 'RP-E4 Slug', builder: 'EMD/NS' },
                                    { model: 'RP-E4C Slug', builder: 'EMD/NS' },
                                    { model: 'RP-E4D Slug', builder: 'EMD/NS' },
                                    { model: 'RP-E4U Slug', builder: 'EMD/NS' },
                                    { model: 'RPU6 Slug', builder: 'EMD/NS' },
                                    { model: 'RPU6D Slug', builder: 'EMD/NS' },
                                    { model: 'SD60E', builder: 'EMD/NS' },
                                    { model: 'SD9M', builder: 'EMD/NS' },
                                    { model: 'TC-10', builder: 'EMD/NS' },

                                    // EMD/Progress Rail
                                    { model: 'SD70ICC', builder: 'EMD/Progress Rail' },

                                    // EMD/SOU
                                    { model: 'RP-E4U Slug', builder: 'EMD/SOU' },

                                    // FM/NW
                                    { model: 'RP-F6Y Slug', builder: 'FM/NW' },

                                    // GE
                                    { model: 'B30-7A1', builder: 'GE' },
                                    { model: 'B36-7', builder: 'GE' },
                                    { model: 'D8-32B', builder: 'GE' },
                                    { model: 'D8-40CW', builder: 'GE' },
                                    { model: 'ET44AC', builder: 'GE' },

                                    // NRE
                                    { model: '3GS21B', builder: 'NRE' },
                                    { model: '3GS21C', builder: 'NRE' },

                                    // NS
                                    { model: 'GP-TEB', builder: 'NS' },
                                    { model: 'RP-E4C', builder: 'NS' },
                                    { model: 'RP-M4C', builder: 'NS' },
                                    { model: 'RP14BD', builder: 'NS' },
                                    { model: 'RP20BD', builder: 'NS' },
                                    { model: 'RP20DC', builder: 'NS' },
                                    { model: 'Slugs', builder: 'NS' },
                                    { model: 'TC-10', builder: 'NS' },

                                    // Progress Rail
                                    { model: 'PR43C', builder: 'Progress Rail' },

                                    // PRC
                                    { model: 'PR43C', builder: 'PRC' },

                                    // Rail Power/NS
                                    { model: 'RP20BD', builder: 'Rail Power/NS' }
                                ];

                                const group = document.createElement('optgroup');
                                group.label = 'Norfolk Southern';
                                nsModels.forEach(item => {
                                    const option = document.createElement('option');
                                    option.value = item.model;
                                    option.textContent = `${item.model} (${item.builder})`;
                                    group.appendChild(option);
                                });
                                modelSelect.appendChild(group);
                            } else {
                                modelSelect.innerHTML = '<option value="">Select Railroad First</option>';
                            }
                        }