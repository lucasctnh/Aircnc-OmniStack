import React, { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import socketio from 'socket.io-client'

import api from '../../services/api'

import './styles.css'

export default function Dashboard(props) {
	const [spots, setSpots] = useState([])
	const [requests, setRequests] = useState([])

	const user_token = localStorage.getItem('auth-token')
	const user_id = localStorage.getItem('user')

	const socket = useMemo(() => socketio('http://localhost:3333', {
		query: { user_id },
	}), [user_id])

	useEffect(() => {
		socket.on('booking_request', data => {
			setRequests([...requests, data])
		})
	}, [requests, socket])

    useEffect(() => {
		props.forceForce()
        async function loadSpots() {
            const response = await api.get('/dashboard', {
                headers: { 'auth-token': user_token }
            })

            setSpots(response.data)
        }

        loadSpots()
	}, [])

	async function handleAccept(id) {
		await api.post(`/bookings/${id}/approvals`, {}, {
			headers: { 'auth-token': user_token }
		})

		setRequests(requests.filter(request => request._id !== id))
	}

	async function handleReject(id) {
		await api.post(`/bookings/${id}/rejections`, {}, {
			headers: { 'auth-token': user_token }
		})

		setRequests(requests.filter(request => request._id !== id))
	}

    return (
        <>
			<ul className="notification">
				{requests.map(request => (
					<li key={request._id}>
						<p>
							<strong>{request.user.email}</strong> está solicitando uma reserva em <strong>{request.spot.company}</strong> para a data: <strong>{request.date}</strong>
						</p>
						<button onClick={() => handleAccept(request._id)} className="accept">ACEITAR</button>
						<button onClick={() => handleReject(request._id)} className="reject">REJEITAR</button>
					</li>
				))}
			</ul>

            <ul className="spot-list">
                {spots.map(spot => (
                    <li key={spot._id}>
                        <header style={{ backgroundImage: `url(${spot.thumbnail_url})` }}/>
                        <strong>{spot.company}</strong>
                        <span>{spot.price ? `R$${spot.price}/dia` : 'GRATUITO'}</span>
                    </li>
                ))}
            </ul>

            <Link to="/new">
                <button className="btn">Cadastrar novo spot</button>
            </Link>
        </>
    )
}