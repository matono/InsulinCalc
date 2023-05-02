import React, { useState, useEffect } from 'react';
import { useCookies } from "react-cookie";

import { Box, Button, Paper, Container, Modal, Typography, Tooltip } from "@mui/material";
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import CssBaseline from '@mui/material/CssBaseline';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import '@fontsource/roboto';

import { InputAdornment, IconButton } from "@mui/material";
import AddIcon from '@mui/icons-material/AddCircle';
import RemoveIcon from '@mui/icons-material/RemoveCircle';
import SubmitIcon from '@mui/icons-material/Autorenew';
import CopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';

import { NumericFormat } from 'react-number-format';

const Line = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  borderTop: '1px solid',
  padding: theme.spacing(0),
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
  flex: 1,
}));

const Item = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  border: '0px solid',
  borderColor: theme.palette.mode === 'dark' ? '#444d58' : '#ced7e0',
  padding: theme.spacing(2),
  textAlign: 'center',
  flex: 1,
}));


const theme = createTheme();

interface InsulinVariables {
  mealCarbohydrates: number;
  insulinToCarbRatio: number;
  carbInsulin: number;
  currentBGL: number;
  targetBGL: number;
  insulinSensitivityFactor: number;
  correctionBolusInsulin: number;
  totalInsulin: number;
}

interface InsulinToCarbRatio {
  breakfast: number;
  lunch: number;
  snack: number;
  dinner: number;
}  

const expireLong = () => {
  const time = new Date(); 
  time.setFullYear(time.getFullYear() + 1);
  return time
}

const expireShort = () => {
  const time = new Date(); 
  time.setMinutes(time.getMinutes() + 120); // 120 min later
  //time.setSeconds(time.getSeconds() + 10); // 10 sec later
  return time
}


const Round = (value: number, base: number) => {
  const pow = (10 ** base);
  return Math.round(value * pow) / pow;
}

const Home: React.FC = () => {  
  const [cookies, setCookie, removeCookie] = useCookies();
  const handleMouseDown = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const [mealCarbs, setMealCarbs] = useState(
    cookies.mealCarbs != undefined ? cookies.mealCarbs as number[]: [0]
  );
  const changeMealCarbs = (index: number, value: number) => {
    const data = [...mealCarbs];
    data[index] = value;
    setMealCarbs(data);
  }
  const addMeal = () => {
    setMealCarbs([...mealCarbs, 0]) 
  }
  const deleteMeal = (index: number) => {
    const data = [...mealCarbs];
    data.splice(index, 1);
    setMealCarbs(data);
  }
  useEffect(() => {
    const totalMeal =  mealCarbs.reduce((sum, element) => sum + element, 0);
    setCookie("mealCarbs", mealCarbs, { expires: expireShort(), path: '/' });
    setInsVars(vars =>({
      ...vars, 
      mealCarbohydrates: totalMeal,
    }));
  }, [mealCarbs])

  const currentInsulinToCarbRatio = () => {
    const now = new Date(); 

    if(cookies.insulinToCarbRatio != undefined){
        return Number(cookies.insulinToCarbRatio); // Cookie 
    }

    const currentHour = now.getHours();
    if(6 <= currentHour && currentHour <= 10 && cookies.insulinToCarbRatio_breakfast != undefined){
      return Number(cookies.insulinToCarbRatio_breakfast);
    }
    if(11 <= currentHour && currentHour <= 13 && cookies.insulinToCarbRatio_lunch != undefined){
      return Number(cookies.insulinToCarbRatio_lunch);
    }
    if(14 <= currentHour && currentHour <= 16 && cookies.insulinToCarbRatio_snack != undefined){
      return Number(cookies.insulinToCarbRatio_snack);
    }
    if(17 <= currentHour && currentHour <= 20 && cookies.insulinToCarbRatio_dinner != undefined){
      return Number(cookies.insulinToCarbRatio_dinner);
    }
    return 1.0;
  }

  const [insVars, setInsVars] = useState<InsulinVariables>(() => {
    //console.log("useState");
    return {
      mealCarbohydrates: 0,
      insulinToCarbRatio: currentInsulinToCarbRatio(),
      carbInsulin: 0,
      currentBGL: cookies.currentBGL != undefined? Number(cookies.currentBGL) : 100,
      targetBGL: cookies.targetBGL != undefined? Number(cookies.targetBGL) : 120,
      insulinSensitivityFactor: cookies.insulinSensitivityFactor != undefined? Number(cookies.insulinSensitivityFactor) : 80,
      correctionBolusInsulin: 0,
      totalInsulin: 0,
    };
  });

  useEffect(() => calcCarbInsulin(insVars.mealCarbohydrates, insVars.insulinToCarbRatio), [
    insVars.mealCarbohydrates,
 //   insVars.insulinToCarbRatio,
  ])
  const calcCarbInsulin = (meal: number, ratio: number) => {
    //console.log("calcCarbInsulin");
    setInsVars(vars => ({
      ...vars, 
      carbInsulin: Round(meal * ratio, 2),
    }));
    setCookie("insulinToCarbRatio", ratio, { expires: expireShort(), path: '/' });
  }

  useEffect(() => {calcCorrectionBolusInsulin(insVars.currentBGL, insVars.targetBGL, insVars.insulinSensitivityFactor)}, [
    insVars.currentBGL,
    insVars.targetBGL,
    insVars.insulinSensitivityFactor,
  ])
  const calcCorrectionBolusInsulin = (current: number, target: number, factor: number) => {
    //console.log("calcCorrectionBolusInsulin")
    setInsVars(vars => ({
      ...vars, 
      correctionBolusInsulin: Round((current - target) / factor, 2),
    }));
    setCookie("currentBGL", current, { expires: expireLong(), path: '/' });
    setCookie("targetBGL", target, { expires: expireLong(), path: '/' });
    setCookie("insulinSensitivityFactor", factor, { expires: expireLong(), path: '/' });
  }

  useEffect(() => {calcTotalInsulin(insVars.carbInsulin, insVars.correctionBolusInsulin)}, [
    insVars.carbInsulin,
    insVars.correctionBolusInsulin,
  ])
  const calcTotalInsulin = (carb: number, bolus: number) => {
    //console.log("calcTotalInsulin")
    setInsVars(vars => ({
      ...vars, 
      totalInsulin: Round(carb + bolus, 2),
    }));
  }
  
  const [resultModal, setResultModal] = React.useState(false);
  const closeResultModal = () => setResultModal(false);
  const openResultModal = () => {
    //console.log("handleOpen")
    calcCarbInsulin(insVars.mealCarbohydrates, insVars.insulinToCarbRatio);
    calcCorrectionBolusInsulin(insVars.currentBGL, insVars.targetBGL, insVars.insulinSensitivityFactor);
    calcTotalInsulin(insVars.carbInsulin, insVars.correctionBolusInsulin);
    setResultModal(true);
  }

  const [carbRatio, setCarbRatio] = useState<InsulinToCarbRatio>({
    breakfast: cookies.insulinToCarbRatio_breakfast != undefined? Number(cookies.insulinToCarbRatio_breakfast) : 1.0,
    lunch: cookies.insulinToCarbRatio_lunch != undefined? Number(cookies.insulinToCarbRatio_lunch) : 1.0,
    snack: cookies.insulinToCarbRatio_snack != undefined? Number(cookies.insulinToCarbRatio_snack) : 1.0,
    dinner: cookies.insulinToCarbRatio_dinner != undefined? Number(cookies.insulinToCarbRatio_dinner) : 1.0,
  });

  const [copyText, setCopyText] = React.useState(
    cookies.copyText != undefined
    ? cookies.copyText 
    : "カーボ比朝${カーボ比.朝食}昼${カーボ比.昼食}間${カーボ比.間食}夕${カーボ比.夕食} 超速:ノボラピッド 持効:トレシーバ"
  );
  useEffect(() => {
    setCookie("copyText", copyText, { expires: expireLong(), path: '/' });
  }, [copyText])
  const getCopyText = (input: string) => {
    const output = input
    .replaceAll("${食前血糖値}",     (insVars.currentBGL).toFixed(0))
    .replaceAll("${目標血糖値}",     (insVars.targetBGL).toFixed(0))
    .replaceAll("${インスリン効果比}",(insVars.insulinSensitivityFactor).toFixed(0))
    .replaceAll("${補正インスリン}", (insVars.correctionBolusInsulin).toFixed(2))
    .replaceAll("${総カーボ数}",     (insVars.mealCarbohydrates).toFixed(2))
    .replaceAll("${カーボ比}",       (insVars.insulinToCarbRatio).toFixed(1))
    .replaceAll("${糖質インスリン}", (insVars.carbInsulin).toFixed(2))
    .replaceAll("${合計インスリン}", (insVars.totalInsulin).toFixed(2))
    .replaceAll("${カーボ比.朝食}",  (carbRatio.breakfast).toFixed(1))
    .replaceAll("${カーボ比.昼食}",  (carbRatio.lunch).toFixed(1))
    .replaceAll("${カーボ比.間食}",  (carbRatio.snack).toFixed(1))
    .replaceAll("${カーボ比.夕食}",  (carbRatio.dinner).toFixed(1) )
    return output;
  }

  const copyTextToClipboard = async(text: string) => {
    if ('clipboard' in navigator) {
      return await navigator.clipboard.writeText(text);
    } else {
      return document.execCommand('copy', true, text);
    }
  }

  const [isCopied, setIsCopied] = useState(false);
  const handleCopyClick = () => {
    // const copyText = 'カーボ比' 
    // + '朝' + carbRatio.breakfast.toFixed(1)  
    // + '昼' + carbRatio.lunch.toFixed(1) 
    // + '間' + carbRatio.snack.toFixed(1)
    // + '夕' + carbRatio.dinner.toFixed(1);
    const str = getCopyText(copyText);
    copyTextToClipboard(str)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 1500);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  const setInsulinToCarbRatio = async(value: number) => {
    setInsVars({
      ...insVars,
      insulinToCarbRatio: value
    })
  }

  const setInsulinToCarbRatio_select = (value: number, target: HTMLInputElement) => {
    setInsulinToCarbRatio(value)
    .then(() => {
      setTimeout(() => {
        target.select();
      }, 100);
    })
    .catch((err) => {
      console.error(err);
    });
  }

  const [copyModal, setCopyModal] = React.useState(false);
  const openCopyModal = () => {
    setCopyModal(true);
  };
  const closeCopyModal = () => {
    setCopyModal(false);
  };

  return (
    <ThemeProvider theme={theme}>
      
      <Container component="main" maxWidth="xl">
        <CssBaseline />
        <Box
          sx={{
            mt: 3,
            mb: 3,
            flexDirection: 'column',
          }}
        >

          {/* 補正インスリン */}
          <Paper component="form" sx={{ mb: 3, p:2 }}>
           <Typography component="h2" variant="h5" sx={{ mb: 3}}>補正インスリン</Typography>

            {/* 補正インスリン式 */}
            <Grid container rowSpacing={2} columnSpacing={0}>
              {/* 左辺 */}
              <Grid item xs={12}>
                
                {/* 分数 */}
                <Grid container>
                  {/* 分子 */}
                  <Grid item xs={12}>
                    <Grid container columns={11}>
                      <Grid item xs={5}>
                        <NumericFormat 
                          id="current_BGL" 
                          value={insVars.currentBGL}
                          valueIsNumericString={true}
                          decimalSeparator="."
                          thousandSeparator=","
                          allowNegative={false}
                          decimalScale={0}
                          fixedDecimalScale              
                          inputProps={{ 
                            inputMode: 'numeric', 
                            pattern: '[0-9]*' 
                          }}
                          onValueChange={(values, sourceInfo) => {
                            setInsVars({
                              ...insVars, 
                              currentBGL: values.floatValue as number,
                            });
                          }}
                          onFocus={event => {
                            event.target.select();
                          }}
                          customInput={TextField} 
                          label="食前血糖値" 
                          variant="outlined" 
                          fullWidth
                            />
                      </Grid>

                      <Grid item xs={1}>
                        <Item>
                          <Typography variant="body1">-</Typography>
                        </Item>
                      </Grid>

                      <Grid item xs={5}>
                        <NumericFormat 
                          id="target_BGL" 
                          value={insVars.targetBGL}
                          valueIsNumericString={true}
                          decimalSeparator="."
                          thousandSeparator=","
                          allowNegative={false}
                          decimalScale={0}
                          fixedDecimalScale              
                          inputProps={{ 
                            inputMode: 'numeric', 
                            pattern: '[0-9]*' 
                          }}
                          onValueChange={(values, sourceInfo) => {
                            setInsVars({
                              ...insVars, 
                              targetBGL: values.floatValue as number,
                            });
                          }}
                          onFocus={event => {
                            event.target.select();
                          }}
                          customInput={TextField} 
                          label="目標血糖値" 
                          variant="outlined" 
                          fullWidth
                            />
                      </Grid>
                    </Grid>
                  </Grid>

                  {/* 分数線 */}
                  <Grid item xs={12}>
                    <Line></Line>
                  </Grid>      

                  {/* 分母 */}
                  <Grid item xs={12}>
                    <NumericFormat 
                      id="insulin_sensitivity_factor" 
                      value={insVars.insulinSensitivityFactor}
                      valueIsNumericString={true}
                      decimalSeparator="."
                      thousandSeparator=","
                      allowNegative={false}
                      decimalScale={0}
                      fixedDecimalScale              
                      inputProps={{ 
                        inputMode: 'numeric', 
                        pattern: '[0-9]*' 
                      }}
                      onValueChange={(values, sourceInfo) => {
                        setInsVars({
                          ...insVars, 
                          insulinSensitivityFactor: values.floatValue as number,
                        });
                      }}
                      onFocus={event => {
                        event.target.select();
                      }}
                      customInput={TextField} 
                      label="インスリン効果比" 
                      variant="outlined" 
                      fullWidth
                        />
                  </Grid>
                </Grid>
              </Grid>

              {/* =右辺 */}
              <Grid item xs={12}>
                <Grid container columns={11}>
                  {/* = */}
                  <Grid item xs={1}>
                    <Item>
                      <Typography variant="body1">=</Typography>
                    </Item>
                  </Grid>

                  {/* 右辺 */}
                  <Grid item xs={10}>
                    <NumericFormat 
                      id="correction_bolus_insulin" 
                      value={insVars.correctionBolusInsulin}
                      inputProps={{ readOnly: true }}
                      type="text"
                      valueIsNumericString={true}
                      decimalSeparator="."
                      thousandSeparator=","
                      allowNegative={false}
                      decimalScale={2}
                      fixedDecimalScale
                      onFocus={event => {
                        event.target.select();
                      }}
                      customInput={TextField} 
                      label="補正インスリン" 
                      variant="filled" 
                      fullWidth
                        />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Paper>

          {/* 糖質インスリン */}
          <Paper component="form" sx={{ mb: 3, p:2 }}>
            <Grid container direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3}}>
              <Grid item xs={12}>
                <Typography component="h2" variant="h5" >糖質インスリン</Typography>
              </Grid>
            </Grid>

            {/* 各食カーボ比 */}
            <Paper sx={{ p:1, mb:2 }} elevation={0} variant="outlined">
              <Grid container direction="row" justifyContent="space-between" alignItems="center">
                <Grid item xs={8}>
                  <Typography component="h3" variant="body1" >カーボ比</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Grid container justifyContent="flex-end">

                    <div>
                      <IconButton color="primary" size="small" onClick={openCopyModal}>
                        <EditIcon  fontSize="small" />
                      </IconButton>
                      <Dialog open={copyModal} onClose={closeCopyModal}>
                        <DialogTitle>コピー文字列</DialogTitle>
                        <DialogContent>
                          <DialogContentText>
                            例: {"カーボ比朝${カーボ比.朝食}昼${カーボ比.昼食}間${カーボ比.間食}夕${カーボ比.夕食} 超速:ノボラピッド 持効:トレシーバ"}``
                          </DialogContentText>
                          <TextField
                            value={copyText}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {setCopyText(e.target.value)}} 
                            type="text" 
                            autoFocus
                            multiline
                            id="name"
                            label="コピー文字列"
                            placeholder="コピー文字列"
                            fullWidth
                            sx={{ mt: 3}}
                          />
                        </DialogContent>
                        <DialogActions>
                          <Button color="primary" onClick={closeCopyModal}>Done</Button>
                        </DialogActions>
                      </Dialog>
                    </div>

                    <Tooltip open={isCopied} title="Copied!" arrow placement="top" 
                            PopperProps={{
                                  modifiers: [
                                    {
                                      name: "offset",
                                      options: {
                                        offset: [0, -15],
                                      },
                                    },
                                  ],
                              }}>
                      <IconButton color="primary" size="small" onClick={handleCopyClick}>
                        <CopyIcon  fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                </Grid>
              </Grid>
  

              <Grid container columnSpacing={1} sx={{p:1}} >
                <Grid item xs={3}>
                  <NumericFormat 
                      value={carbRatio.breakfast}
                      type="text"
                      valueIsNumericString={true}
                      decimalSeparator="."
                      thousandSeparator=","
                      allowNegative={false}
                      decimalScale={1}
                      fixedDecimalScale              
                      inputProps={{ 
                        inputMode: 'decimal', 
                        pattern: '[0-9].*' 
                      }}
                      onValueChange={(values, sourceInfo) => {
                        const value = values.floatValue as number;
                        setCarbRatio({
                          ...carbRatio,
                          breakfast: value
                        });
                        setCookie("insulinToCarbRatio_breakfast", value, { expires: expireLong(), path: '/' });
                        setInsVars({
                          ...insVars, 
                          insulinToCarbRatio: Number(value),
                        });
                      }}
                      onFocus={event => {
                        setInsulinToCarbRatio_select(carbRatio.breakfast, event.target);
                      }}
                      customInput={TextField} 
                      label="朝食" 
                      variant="outlined" 
                      fullWidth
                        />
                </Grid>
                <Grid item xs={3}>
                  <NumericFormat 
                      value={carbRatio.lunch}
                      type="text"
                      valueIsNumericString={true}
                      decimalSeparator="."
                      thousandSeparator=","
                      allowNegative={false}
                      decimalScale={1}
                      fixedDecimalScale              
                      inputProps={{ 
                        inputMode: 'decimal', 
                        pattern: '[0-9].*' 
                      }}
                      onValueChange={(values, sourceInfo) => {
                        const value = values.floatValue as number;
                        setCarbRatio({
                          ...carbRatio,
                          lunch: value
                        });
                        setCookie("insulinToCarbRatio_lunch", value, { expires: expireLong(), path: '/' });
                        setInsVars({
                          ...insVars, 
                          insulinToCarbRatio: Number(value),
                        });
                      }}
                      onFocus={event => {
                        setInsulinToCarbRatio_select(carbRatio.lunch, event.target);
                      }}
                      customInput={TextField} 
                      label="昼食" 
                      variant="outlined" 
                      fullWidth
                        />
                </Grid>
                <Grid item xs={3}>
                  <NumericFormat 
                      value={carbRatio.snack}
                      type="text"
                      valueIsNumericString={true}
                      decimalSeparator="."
                      thousandSeparator=","
                      allowNegative={false}
                      decimalScale={1}
                      fixedDecimalScale              
                      inputProps={{ 
                        inputMode: 'decimal', 
                        pattern: '[0-9].*' 
                      }}
                      onValueChange={(values, sourceInfo) => {
                        const value = values.floatValue as number;
                        setCarbRatio({
                          ...carbRatio,
                          snack: value
                        });
                        setCookie("insulinToCarbRatio_snack", value, { expires: expireLong(), path: '/' });
                        setInsVars({
                          ...insVars, 
                          insulinToCarbRatio: Number(value),
                        });
                      }}
                      onFocus={event => {
                        setInsulinToCarbRatio_select(carbRatio.snack, event.target);
                      }}
                      customInput={TextField} 
                      label="間食" 
                      variant="outlined" 
                      fullWidth
                        />
                </Grid>
                <Grid item xs={3}>
                  <NumericFormat 
                      value={carbRatio.dinner}
                      type="text"
                      valueIsNumericString={true}
                      decimalSeparator="."
                      thousandSeparator=","
                      allowNegative={false}
                      decimalScale={1}
                      fixedDecimalScale              
                      inputProps={{ 
                        inputMode: 'decimal', 
                        pattern: '[0-9].*' 
                      }}
                      onValueChange={(values, sourceInfo) => {
                        const value = values.floatValue as number;
                        setCarbRatio({
                          ...carbRatio,
                          dinner: value
                        });
                        setCookie("insulinToCarbRatio_dinner", value, { expires: expireLong(), path: '/' });
                        setInsVars({
                          ...insVars, 
                          insulinToCarbRatio: Number(value),
                        });
                      }}
                      onFocus={event => {
                        setInsulinToCarbRatio_select(carbRatio.dinner, event.target);
                      }}
                      customInput={TextField} 
                      label="夕食" 
                      variant="outlined" 
                      fullWidth
                        />
                </Grid>
              </Grid>
            </Paper>

            {/* 糖質インスリン式 */}
            <Grid container rowSpacing={2} columnSpacing={0}>
              {/* 左辺 */}
              <Grid item xs={12}>
                <Grid container columns={11}  direction="row" justifyContent="center" alignItems="flex-end">

                  <Grid item xs={5}>
                    <Grid container rowSpacing={1}>
                      {
                        mealCarbs.map((input, index) => {
                          return (
                            <Grid item xs={12} key={index}>
                              <NumericFormat 
                                value={mealCarbs[index]}
                                type="text"
                                valueIsNumericString={true}
                                decimalSeparator="."
                                thousandSeparator=","
                                allowNegative={false}
                                decimalScale={2}
                                fixedDecimalScale              
                                inputProps={{ 
                                  inputMode: 'decimal', 
                                  pattern: '[0-9].*' 
                                }}
                                onValueChange={(values, sourceInfo) => {
                                  changeMealCarbs(index, values.floatValue as number)
                                }}
                                InputProps={{
                                  endAdornment:
                                    <InputAdornment position="end">
                                      <IconButton
                                        onClick={event => deleteMeal(index)}
                                        onMouseDown={handleMouseDown}
                                        edge="end"
                                        color="error"
                                        size="large"
                                      >
                                        <RemoveIcon />
                                      </IconButton>
                                    </InputAdornment>
                                }}
                                onFocus={event => {
                                  event.target.select();
                                }}
                                customInput={TextField} 
                                label="カーボ数" 
                                variant="outlined" 
                                fullWidth
                                  />
                            </Grid>
                          )
                        })
                      }

                      <Grid item xs={12}>
                        <NumericFormat 
                          id="meal_carbohydrates" 
                          value={insVars.mealCarbohydrates}
                          inputProps={{ readOnly: true }}
                          type="text"
                          valueIsNumericString={true}
                          decimalSeparator="."
                          thousandSeparator=","
                          allowNegative={false}
                          decimalScale={2}
                          fixedDecimalScale
                          onFocus={event => {
                            event.target.select();
                          }}
                          InputProps={{
                            endAdornment: 
                              <InputAdornment position="end">
                                <IconButton
                                  sx={{pr:1.75}}
                                  onClick={addMeal}
                                  onMouseDown={handleMouseDown}
                                  edge="end"
                                  color="primary"
                                  size="large"
                                >
                                  <AddIcon />
                                </IconButton>
                              </InputAdornment>
                          }}
                          customInput={TextField} 
                          label="総カーボ数" 
                          variant="filled" 
                          fullWidth
                            />
                      </Grid> 
                    </Grid>
                  </Grid>
                  
                  <Grid item xs={1}>
                    <Item>
                      <Typography variant="body1">x</Typography>
                    </Item>
                  </Grid>

                  <Grid item xs={5}>
                    <NumericFormat 
                      id="insulin_to_carb_ratio" 
                      value={insVars.insulinToCarbRatio}
                      type="text"
                      valueIsNumericString={true}
                      decimalSeparator="."
                      thousandSeparator=","
                      allowNegative={false}
                      decimalScale={1}
                      fixedDecimalScale              
                      inputProps={{ 
                        inputMode: 'decimal', 
                        pattern: '[0-9].*' 
                      }}
                      onValueChange={(values, sourceInfo) => {
                        setInsVars({
                          ...insVars, 
                          insulinToCarbRatio: values.floatValue as number,
                        });
                      }}
                      onFocus={event => {
                        event.target.select();
                      }}
                      customInput={TextField} 
                      label="カーボ比" 
                      variant="outlined" 
                      fullWidth
                        />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Grid container columns={11}>
                  {/* = */}
                  <Grid item xs={1}>
                      <Item>
                        <Typography variant="body1">=</Typography>
                      </Item>
                  </Grid>

                  {/* 右辺 */}
                  <Grid item xs={10}>
                    <NumericFormat 
                      id="carb_insulin" 
                      value={insVars.carbInsulin}
                      inputProps={{ readOnly: true }}
                      type="text"
                      valueIsNumericString={true}
                      decimalSeparator="."
                      thousandSeparator=","
                      allowNegative={false}
                      decimalScale={2}
                      fixedDecimalScale
                      onFocus={event => {
                        event.target.select();
                      }}
                      customInput={TextField} 
                      label="糖質インスリン" 
                      variant="filled" 
                      fullWidth
                        />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Paper>

          {/* 計算ボタン */}
          <Box sx={{ mb: 3 }}>
            <Grid container direction="row" justifyContent="center" alignItems="center">
              <Grid item xs={12}>
                <Button 
                  variant="contained" 
                  startIcon={<SubmitIcon />} 
                  size="large"
                  fullWidth   
                  onClick={openResultModal} >
                  計算
                </Button>
                <Dialog open={resultModal} onClose={closeResultModal}>
                  <DialogTitle>インスリン単位数</DialogTitle>
                  <DialogContent>
                    <DialogContentText>
                    ( {insVars.currentBGL} - {insVars.targetBGL} ) / {insVars.insulinSensitivityFactor} + ({insVars.mealCarbohydrates} * {insVars.insulinToCarbRatio}) <br />
                  = {insVars.correctionBolusInsulin} + {insVars.carbInsulin} <br />
                  = {insVars.totalInsulin} &uuml;
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={closeResultModal}>Close</Button>
                  </DialogActions>
                </Dialog>
{/*
                <Modal
                  open={resultModal}
                  onClose={closeResultModal}
                  aria-labelledby="modal-modal-title"
                  aria-describedby="modal-modal-description"
                >

                  <Box sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 400,
                      bgcolor: 'background.paper',
                      boxShadow: 24,
                      p: 4,
                  }}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                      インスリン単位数
                    </Typography>
                    <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                      ( {insVars.currentBGL} - {insVars.targetBGL} ) / {insVars.insulinSensitivityFactor} + ({insVars.mealCarbohydrates} * {insVars.insulinToCarbRatio}) <br />
                       = {insVars.correctionBolusInsulin} + {insVars.carbInsulin} <br />
                       = {insVars.totalInsulin} &uuml;
                    </Typography>
                  </Box>
                </Modal>
*/}
              </Grid>
            </Grid>
          </Box>

          {/* 合計インスリン式 */}
          <Paper component="form" sx={{ mb: 3, p:2 }} >
            <Typography component="h2" variant="h5" sx={{ mb: 3}}>合計インスリン</Typography>
  
            <Grid container rowSpacing={2} columnSpacing={0}>
              {/* 左辺 */}
              <Grid item xs={12}>
                <Grid container columns={11}>

                <Grid item xs={5}>
                    <NumericFormat 
                      id="correction_bolus_insulin2" 
                      value={insVars.correctionBolusInsulin}
                      decimalSeparator="."
                      thousandSeparator=","
                      allowNegative={true}
                      decimalScale={2}
                      fixedDecimalScale              
                      inputProps={{ 
                        inputMode: 'decimal', 
                        pattern: '[0-9].*' 
                      }}
                      onValueChange={(values, sourceInfo) => {
                        setInsVars({
                          ...insVars, 
                          correctionBolusInsulin: values.floatValue as number,
                        });
                      }}
                      onFocus={event => {
                        event.target.select();
                      }}
                      type="text"
                      customInput={TextField} 
                      label="補正インスリン" 
                      variant="outlined" 
                      fullWidth
                        />
                  </Grid>
                  
                  <Grid item xs={1}>
                    <Item>
                      <Typography variant="body1">+</Typography>
                    </Item>
                  </Grid>

                  <Grid item xs={5}>
                    <NumericFormat 
                      id="carb_insulin2" 
                      value={insVars.carbInsulin}
                      valueIsNumericString={true}
                      decimalSeparator="."
                      thousandSeparator=","
                      allowNegative={false}
                      decimalScale={2}
                      fixedDecimalScale              
                      inputProps={{ 
                        inputMode: 'decimal', 
                        pattern: '[0-9].*' 
                      }}
                      onValueChange={(values, sourceInfo) => {
                        setInsVars({
                          ...insVars, 
                          carbInsulin: values.floatValue as number,
                        });
                      }}
                      onFocus={event => {
                        event.target.select();
                      }}
                      type="text"
                      customInput={TextField} 
                      label="糖質インスリン" 
                      variant="outlined" 
                      fullWidth
                        />
                  </Grid>
                  
                </Grid>
              </Grid>  

              {/* =右辺 */}
              <Grid item xs={12}>
                <Grid container columns={11}>
                  {/* = */}
                  <Grid item xs={1}>
                    <Item>
                      <Typography variant="body1">=</Typography>
                    </Item>
                  </Grid>

                  {/* 右辺 */}
                  <Grid item xs={10}>
                    <NumericFormat 
                      id="total_insulin" 
                      value={insVars.totalInsulin}
                      inputProps={{ readOnly: true }}
                      type="text"
                      valueIsNumericString={true}
                      decimalSeparator="."
                      thousandSeparator=","
                      allowNegative={false}
                      decimalScale={2}
                      fixedDecimalScale
                      onFocus={event => {
                        event.target.select();
                      }}
                      customInput={TextField} 
                      label="合計インスリン" 
                      variant="filled" 
                      fullWidth
                        />
                  </Grid>
                </Grid>
              </Grid>  
            </Grid>
          </Paper>

        </Box>
      </Container>

    </ThemeProvider>
  );
};

export default Home