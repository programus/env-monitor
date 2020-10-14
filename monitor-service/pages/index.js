import React from 'react'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import axios from 'axios'
export default class Home extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      positions: [],
      envs: [],
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

  async keepRefrehsingEnvs() {
    const envs = await Promise.all(this.state.positions.map(async p => {
      const {device_id, position_name, position_desc} = p
      const {data} = await axios.get(`/api/latest?id=${device_id}`)
      return {
        ...p,
        ...data.results[0],
      }
    }))
    console.log(envs)

    this.setState({
      envs,
    })

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
                  <div>{new Date(e.date_time).toString()}</div>
                </div>
              )
            }
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
