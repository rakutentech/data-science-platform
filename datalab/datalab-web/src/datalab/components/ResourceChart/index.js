
import React from 'react';
import PropTypes from 'prop-types';
import { ProgressBar } from 'react-bootstrap'
import { Doughnut } from 'react-chartjs-2';

const formatMetric = (n) =>{
  let message = `${n}`
  if(n > 1000000000){
    message = `${(n/1000000000).toFixed(1)}G`
  }else if(n > 1000000){
    message = `${(n/1000000).toFixed(1)}M`
  }else if(n > 1000){
    message = `${(n/1000).toFixed(1)}K`
  }
  return message
}

export const ResourceBar = (props) => {
  const { usage, total } = props
  const percentage = total == 0?0:(usage*100/total)
  let variant = 'success'
  if(percentage > 60){
    variant = 'warning'
  }
  if(percentage > 85){
    variant = 'danger'
  }

  return (
    <div style={{width: props.width}} className={props.className}>
      <ProgressBar className="resource-bar" now={percentage} variant={variant}/>
      <div>
        <div className="float-left resource-bar__message">
          {formatMetric(usage)} / {formatMetric(total)}
        </div>
        <div className="text-right resource-bar__message">
          {percentage.toFixed(1)}%
        </div>
      </div>
    </div>
  )
} 
  
ResourceBar.propTypes = {
  usage: PropTypes.number,
  total: PropTypes.number,
  width: PropTypes.string,
  className: PropTypes.string
}

export const CircleChart = (props) => {
  const dataDoughnut= {
    labels: props.data.map(element => element.label),
    datasets: [
      {
        data: props.data.map(element => element.value),
        backgroundColor: props.data.map(element => element.bgColor)
      }
    ]
  }
  return (
    <div className={props.className}>
      <Doughnut data={dataDoughnut} 
        width={props.width}
        height={props.width}
        options={{ responsive: false }} legend={{display:false}}/>
      <h2 className="text-center">{props.title}</h2>
    </div>
  )
}

CircleChart.propTypes = {
  title:PropTypes.string,
  data: PropTypes.array,
  width: PropTypes.number,
  className: PropTypes.string
}

export function* CircleChartColors(){
  const array = [
    '#3380DE', 
    '#DEF4D5',
    '#64A8E8',
    '#FFDF79',
    '#CFE8FC', 
    '#78BC5C',
    '#96DA7A',
    '#4692E3', 
    '#BCEDA8',
    '#F6C15B',
    '#FFEEAB'
  ]
  let index = 0
  while(true){
    if(index >= array.length){
      index = 0
    }
    yield array[index]
    index++
  }
}
  