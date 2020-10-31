import React from 'react'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import axios from 'axios'
import moment from 'moment'
import ReactEcharts from 'echarts-for-react'

export default class Home extends React.Component {
  dateTimeFormat = 'YYYY-MM-DD HH:mm:ss'

  constructor(props) {
    super(props)
    this.state = {
      positions: [],
      envs: [],
      tChartOptions: {},
      hChartOptions: {},
    }
    this.initState()
  }

  async initState() {
    const {data} = await axios.get('/api/positions')
    this.setState({
      positions: data.results,
    })

    this.keepRefrehsingEnvs()
  }

  async updateLatestEnvs() {
    const envs = await Promise.all(this.state.positions.map(async p => {
      const {device_id} = p
      const {data} = await axios.get(`/api/latest?id=${device_id}`)
      return {
        ...p,
        ...data.results[0],
      }
    }))

    this.setState({
      envs,
    })
  }

  getMinMaxValues(rawData) {
    let minT = rawData[0].results[0].temperature
    let maxT = minT
    let minH = rawData[0].results[0].humidity
    let maxH = minH

    const scale = 5

    for (let i = 0; i < rawData.length; i++) {
      const results = rawData[i].results
      for (let j = 0; j < results.length; j++) {
        const item = results[j]
        if (minT > item.temperature) {
          minT = Math.floor(item.temperature / scale) * scale
        }
        if (maxT < item.temperature) {
          maxT = Math.ceil(item.temperature / scale) * scale
        }
        if (minH > item.humidity) {
          minH = Math.floor(item.humidity / scale) * scale
        }
        if (maxH < item.humidity) {
          maxH = Math.ceil(item.humidity / scale) * scale
        }
      }
    }

    return {
      temperature: {
        min: minT,
        max: maxT,
      },
      humidity: {
        min: minH,
        max: maxH,
      },
    }
  }

  getSeries(rawData, type) {
    return rawData.map(r => {
      const {position_name, results} = r
      return {
        name: position_name,
        type: 'line',
        data: results.map(r => [
          r.date_time, 
          r[type].toFixed(2),
        ]),
      }
    })
  }

  async updateCharts() {
    const to = new Date().getTime()
    const unit = 60
    const from = to - unit * 60000 * 1000 // display max 1000 points
    const rawData = await Promise.all(this.state.positions.map(async p => {
      const {device_id} = p
      const {data} = await axios.get(`/api/query?id=${device_id}&from=${from}&to=${to}&unit=${unit}`)
      const {results} = data
      return {
        ...p,
        results,
      }
    }))

    const commonOptions = {
      legend: {
        type: 'plain',
        show: true,
      },
      tooltip: {
        trigger: 'axis',
      },
      xAxis: {
        type: 'time',
        // ...this.getXAxis(rawData, unit),
        // data: this.getXAxis(rawData, unit),
      },
      dataZoom: [{
        // startValue: new Date().getTime() - 3 * 24 * 3600 * 1000,
      }, {
        type: 'slider',
      }],
    }

    const minMaxValue = this.getMinMaxValues(rawData)

    const tChartOptions = {
      ...commonOptions,
      title: {
        text: 'Temperature',
      },
      yAxis: {
        type: 'value',
        ...minMaxValue.temperature,
      },
      series: this.getSeries(rawData, 'temperature'),
    }

    const hChartOptions = {
      ...commonOptions,
      title: {
        text: 'Humidity',
      },
      yAxis: {
        type: 'value',
        ...minMaxValue.humidity,
      },
      series: this.getSeries(rawData, 'humidity'),
    }

    console.log(tChartOptions)

    this.setState({
      tChartOptions,
      hChartOptions,
    })
  }

  async keepRefrehsingEnvs() {
    await Promise.all([
      this.updateLatestEnvs(),
      this.updateCharts(),
    ])
    setTimeout(() => this.keepRefrehsingEnvs(), 60000)
  }

  render() {
    return (
      <div className={styles.container}>
        <Head>
          <title>Home Temperature & Humidity</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className={styles.main}>
          <h1 className={styles.title}> </h1>

          <p className={styles.description}>
          T & H for each room
          </p>

          <div className={styles.grid}>
            {
              this.state.envs.map(e => 
                <div className={styles.card} key={e.device_id}>
                  <h3>{e.position_name}</h3>
                  <div>T: {e.temperature}℃</div>
                  <div>H: {e.humidity}%</div>
                  <div className={styles.note}>{moment(e.date_time).format(this.dateTimeFormat)}</div>
                </div>
              )
            }
          </div>
          <div className={styles.chart}>
            <ReactEcharts option={this.state.tChartOptions} />
          </div>
          <div className={styles.chart}>
            <ReactEcharts option={this.state.hChartOptions} />
          </div>
        </main>

        <footer className={styles.footer}>
          <a
            href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Powered by{' '}
            <img src="/vercel.svg" alt="Vercel Logo" className={styles.logo} />
          </a>
        </footer>
      </div>
    )
  }
}
