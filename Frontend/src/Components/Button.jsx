function AuthButtons({ activeTab, onTabChange }) {
	return (
		<div className="auth-buttons">
			<button
				type="button"
				className={`btn btn-login ${activeTab === 'login' ? 'active' : ''}`}
				onClick={() => onTabChange('login')}
			>
				Login
			</button>
			<button
				type="button"
				className={`btn btn-signup ${activeTab === 'signup' ? 'active' : ''}`}
				onClick={() => onTabChange('signup')}
			>
				Sign Up
			</button>
		</div>
	)
}

export default AuthButtons
