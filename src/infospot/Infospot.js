( function () {

	/**
	 * Information spot attached to panorama
	 * @constructor
	 * @param {number} [scale=1] - Infospot scale
	 * @param {imageSrc} [imageSrc=PANOLENS.DataImage.Info] - Image overlay info
	 * @param {HTMLElement} [container=document.body] - The dom element contains infospot elements
	 */
	PANOLENS.Infospot = function ( scale, imageSrc, container ) {
		
		var scope = this, ratio;

		THREE.Sprite.call( this );

		this.type = 'infospot';

		this.isHovering = false;
		this.element;
		this.toPanorama;

		this.container = container || document.body;

		// Default is not visible until panorama is loaded
		this.visible = false;

		scale = scale || 1;
		imageSrc = imageSrc || PANOLENS.DataImage.Info;

		this.scale.set( scale, scale, 1 );

		PANOLENS.Utils.TextureLoader.load( imageSrc, postLoad );		

		function postLoad ( texture ) {

			texture.minFilter = texture.maxFilter = THREE.LinearFilter;

			texture.wrapS = THREE.RepeatWrapping;

			texture.repeat.x = -1;

			scope.material.map = texture;
			scope.material.depthWrite = false;
			scope.material.depthTest = false;

			ratio = texture.image.width / texture.image.height;

			scope.scale.set( ratio * scale, scale, 1 );

			scope.hoverStartScale = scope.scale.clone();
			scope.hoverEndScale = scope.scale.clone().multiplyScalar( 1.3 );
			scope.hoverEndScale.z = 1;

			scope.scaleUpAnimation = new TWEEN.Tween( scope.scale )
				.to( { x: scope.hoverEndScale.x, y: scope.hoverEndScale.y }, 500 )
				.easing( TWEEN.Easing.Elastic.Out );

			scope.scaleDownAnimation = new TWEEN.Tween( scope.scale )
				.to( { x: scope.hoverStartScale.x, y: scope.hoverStartScale.y }, 500 )
				.easing( TWEEN.Easing.Elastic.Out );

			scope.showAnimation = new TWEEN.Tween( scope.material )
				.to( { opacity: 1 }, scope.animationDuration )
				.onStart( function () { scope.visible = true; } )
				.easing( TWEEN.Easing.Quartic.Out );

			scope.hideAnimation = new TWEEN.Tween( scope.material )
				.to( { opacity: 0 }, scope.animationDuration )
				.onComplete( function () { scope.visible = false; } )
				.easing( TWEEN.Easing.Quartic.Out );

		}

	}

	PANOLENS.Infospot.prototype = Object.create( THREE.Sprite.prototype );

	PANOLENS.Infospot.prototype.onClick = function () {

		if ( this.element ) {

			this.lockHoverElement();

		}

		this.dispatchEvent( { type: 'click' } );

	};

	PANOLENS.Infospot.prototype.onHover = function ( x, y ) {

		if ( !this.isHovering ) {

			this.onHoverStart();
			this.isHovering = true;

		}

		if ( !this.element || this.element.locked ) { return; }

		var left, top;

		left = x - this.element.clientWidth / 2;
		top = y - this.element.clientHeight - 30;

		this.element.style.webkitTransform =
		this.element.style.msTransform =
		this.element.style.transform = 'translate(' + left + 'px, ' + top + 'px)';

	};

	PANOLENS.Infospot.prototype.onHoverStart = function() {

		if ( !this.hoverEndScale.equals( this.scale ) ) {

			this.scaleDownAnimation.stop();
			this.scaleUpAnimation.start();

		}

		if ( this.element && this.element.style.display === 'none' ) {

			this.element.style.display = 'block';

		}

	};

	PANOLENS.Infospot.prototype.onHoverEnd = function() {

		this.isHovering = false;
		
		if ( !this.hoverStartScale.equals( this.scale ) ) {

			this.scaleUpAnimation.stop();
			this.scaleDownAnimation.start();

		}

		if ( this.element && this.element.style.display !== 'none' ) {

			this.element.style.display = 'none';
			this.unlockHoverElement();

		}

	};

	PANOLENS.Infospot.prototype.setText = function ( text ) {

		if ( this.element ) {

			this.element.textContent = text;

		}

	};

	PANOLENS.Infospot.prototype.addHoverText = function ( text ) {

		if ( !this.element ) {

			this.element = document.createElement( 'div' );

			this.element.style.color = '#fff';
			this.element.style.top = 0;
			this.element.style.maxWidth = '50%';
			this.element.style.maxHeight = '50%';
			this.element.style.textShadow = '0 0 3px #000000';
			this.element.style.fontFamily = '"Trebuchet MS", Helvetica, sans-serif';
			this.element.style.position = 'absolute';
			this.element.style.display = 'none';
			this.element.classList.add( 'panolens-infospot' );

			this.container.appendChild( this.element );

		}

		this.setText( text );

	};

	PANOLENS.Infospot.prototype.addHoverElement = function ( el ) {

		if ( !this.element ) { 

			this.element = el.cloneNode( true );
			this.element.style.top = 0;
			this.element.style.position = 'absolute';
			this.element.style.display = 'none';
			this.element.classList.add( 'panolens-infospot' );

			this.container.appendChild( this.element );

		}

	};

	PANOLENS.Infospot.prototype.removeHoverElement = function () {

		if ( this.element ) { 

			this.container.removeChild( this.element );

			this.element = undefined;

		}

	};

	PANOLENS.Infospot.prototype.lockHoverElement = function () {

		if ( this.element ) { 

			this.element.locked = true;

		}

	};

	PANOLENS.Infospot.prototype.unlockHoverElement = function () {

		if ( this.element ) { 

			this.element.locked = false;

		}

	};

	PANOLENS.Infospot.prototype.show = function ( delay ) {

		delay = delay || 0;

		this.hideAnimation && this.hideAnimation.stop();
		this.showAnimation && this.showAnimation.delay( delay ).start();

	};

	PANOLENS.Infospot.prototype.hide = function ( delay ) {

		delay = delay || 0;

		this.showAnimation && this.showAnimation.stop();
		this.hideAnimation && this.hideAnimation.delay( delay ).start();
		
	};

} )()