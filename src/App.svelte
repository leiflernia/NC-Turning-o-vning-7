<script>
	import Modal from "./Modal.svelte";

	const videoFileUrls = [
		"clip-1.mp4",
		"clip-2.mp4",
		"clip-3.mp4",
		"clip-4.mp4",
		"clip-5.mp4",
		"clip-6.mp4",
		"clip-7.mp4",
		"clip-8.mp4",
		"clip-9.mp4",
		"clip-10.mp4",
		"clip-11.mp4",
	];

	window.caches
		.open("video")
		.then((cache) =>
			Promise.all(
				videoFileUrls.map((videoFileUrl) =>
					fetchAndCache(videoFileUrl, cache)
				)
			)
		);

	function deleteVideo() {
		caches.delete("video");
	}

	function fetchAndCache(videoFileUrls, cache) {
		// Check first if video is in the cache.
		return cache.match(videoFileUrls).then((cacheResponse) => {
			// Let's return cached response if video is already in the cache.
			if (cacheResponse) {
				return cacheResponse;
			}
			// Otherwise, fetch the video from the network.
			return fetch(videoFileUrls).then((networkResponse) => {
				// Add the response to the cache and return network response in parallel.
				cache.put(videoFileUrls, networkResponse.clone());
				return networkResponse;
			});
		});
	}

	function make_uppercase() {
		this.value = this.value.toLocaleUpperCase();
	}

	let showModal1Wrong = false;
	let showModal1Tip = false;
	let tip1 = 1;

	let showModal2Wrong = false;
	let showModal2Tip = false;
	let tip2 = 1;

	let showModal3Wrong = false;
	let showModal3Tip = false;
	let tip3 = 1;

	let showModal4Wrong = false;
	let showModal4Tip = false;
	let tip4 = 1;

	let showModal5Wrong = false;
	let showModal5Tip = false;
	let tip5 = 1;

	let showModal6Wrong = false;
	let showModal6Tip = false;
	let tip6 = 1;

	let showModal7Wrong = false;
	let showModal7Tip = false;
	let tip7 = 1;

	let showModal8Wrong = false;
	let showModal8Tip = false;
	let tip8 = 1;

	let showModal9Wrong = false;
	let showModal9Tip = false;
	let tip9 = 1;
	
	let showModal10Wrong = false;
	let showModal10Tip = false;
	let tip10 = 1;

	let first = true;
	let startRotationValue = "";
	let second = false;
	let point1Value = "";
	let third = false;
	let point2Value = "";
	let fourth = false;
	let point3Value = "";
	let fift = false;
	let point4Value = "";
	let sixt = false;
	let point5Value = "";
	let seventh = false;
	let point6Value = "";
	let eight = false;
	let point7Value = "";
	let ninth = false;
	let point8Value = "";
	let tenth = false;
	let point9Value = "";
	let eleventh = false;
	let twelfth = false;
	let thirteen = false;
	let fourteen = false;
	let fifteen = false;
	let sixteen = false;
	let seventeen = false;
	let eigtheen = false;
	let nineteen = false;

	function startRotation() {
		if (
			startRotationValue.toLocaleUpperCase().replace(/\s/g, "") ==
				"M4S1000" ||
			startRotationValue.toLocaleUpperCase().replace(/\s/g, "") ==
				"M04S1000"
		) {
			second = true;
			first = false;
		} else if (tip1 == 1) {
			showModal1Wrong = true;
			tip1 = 2;
		} else if (tip1 == 2) {
			showModal1Wrong = true;
			tip1 = 3;
		} else {
			showModal1Tip = true;
		}
	}
	function point1() {
		if (
			point1Value.toLocaleUpperCase().replace(/\s/g, "") == "G0X5Z25" ||
			point1Value.toLocaleUpperCase().replace(/\s/g, "") == "G00X5Z25"
		) {
			fourth = true;
			second = false;
		} else if (tip2 == 1) {
			showModal2Wrong = true;
			tip2 = 2;
		} else if (tip2 == 2) {
			showModal2Wrong = true;
			tip2 = 3;
		} else {
			showModal2Tip = true;
		}
	}

	function point2() {
		if (
			point2Value.toLocaleUpperCase().replace(/\s/g, "") == "G1X0Z20" ||
			point2Value.toLocaleUpperCase().replace(/\s/g, "") == "G01X0Z20"
		) {
			sixt = true;
			fourth = false;
		} else if (tip3 == 1) {
			showModal3Wrong = true;
			tip3 = 2;
		} else if (tip3 == 2) {
			showModal3Wrong = true;
			tip3 = 3;
		} else {
			showModal3Tip = true;
		}
	}

	function point3() {
		if (
			point3Value.toLocaleUpperCase().replace(/\s/g, "") == "G1X10Z20" ||
			point3Value.toLocaleUpperCase().replace(/\s/g, "") == "G01X10Z20"
		) {
			eight = true;
			sixt = false;
		} else if (tip4 == 1) {
			showModal4Wrong = true;
			tip4 = 2;
		} else if (tip4 == 2) {
			showModal4Wrong = true;
			tip4 = 3;
		} else {
			showModal4Tip = true;
		}
	}

	function point4() {
		if (
			point4Value.toLocaleUpperCase().replace(/\s/g, "") ==
				"G3X40Z5I0K-15" ||
			point4Value.toLocaleUpperCase().replace(/\s/g, "") ==
				"G03X40Z5I0K-15"
		) {
			eight = false;
			tenth = true;
		} else if (tip5 == 1) {
			showModal5Wrong = true;
			tip5 = 2;
		} else if (tip5 == 2) {
			showModal5Wrong = true;
			tip5 = 3;
		} else {
			showModal5Tip = true;
		}
	}

	function point5() {
		if (
			point5Value.toLocaleUpperCase().replace(/\s/g, "") == "G1X40Z0" ||
			point5Value.toLocaleUpperCase().replace(/\s/g, "") == "G01X40Z0"
		) {
			tenth = false;
			twelfth = true;
		} else if (tip6 == 1) {
			showModal6Wrong = true;
			tip6 = 2;
		} else if (tip6 == 2) {
			showModal6Wrong = true;
			tip6 = 3;
		} else {
			showModal6Tip = true;
		}
	}

	function point6() {
		if (
			point6Value.toLocaleUpperCase().replace(/\s/g, "") ==
				"G2X50Z-5I5K0" ||
			point6Value.toLocaleUpperCase().replace(/\s/g, "") ==
				"G02X50Z-5I5K0"
		) {
			twelfth = false;
			fourteen = true;
		} else if (tip7 == 1) {
			showModal7Wrong = true;
			tip7 = 2;
		} else if (tip7 == 2) {
			showModal7Wrong = true;
			tip7 = 3;
		} else {
			showModal7Tip = true;
		}
	}

	function point7() {
		if (
			point7Value.toLocaleUpperCase().replace(/\s/g, "") == "G1X60Z-5" ||
			point7Value.toLocaleUpperCase().replace(/\s/g, "") == "G01X60Z-5"
		) {
			fourteen = false;
			sixteen = true;
		} else if (tip8 == 1) {
			showModal8Wrong = true;
			tip8 = 2;
		} else if (tip8 == 2) {
			showModal8Wrong = true;
			tip8 = 3;
		} else {
			showModal8Tip = true;
		}
	}

	function point8() {
		if (
			point8Value.toLocaleUpperCase().replace(/\s/g, "") ==
				"G3X70Z-10I0K-5" ||
			point8Value.toLocaleUpperCase().replace(/\s/g, "") ==
				"G03X70Z-10I0K-5"
		) {
			sixteen = false;
			eigtheen = true;
		} else if (tip9 == 1) {
			showModal9Wrong = true;
			tip9 = 2;
		} else if (tip9 == 2) {
			showModal9Wrong = true;
			tip9 = 3;
		} else {
			showModal9Tip = true;
		}
	}

	function end() {
		if (point9Value.toLocaleUpperCase().replace(/\s/g, "") == "G1X70Z-30") {
			eigtheen = false;
			nineteen = true;
		} else if (tip10 == 1) {
			showModal10Wrong = true;
			tip10 = 2;
		} else if (tip10 == 2) {
			showModal10Wrong = true;
			tip10 = 3;
		} else {
			showModal10Tip = true;
		}
	}
</script>

{#if first}
	<div class="canvas">
		<!-- <video autoplay loop width="0px">
      <source src="clip-1.mp4" type="video/mp4" />
      Du måste använda en annan webbläsare för att kunna spela upp video.
    </video> -->
		<div>
			<img width="100%" src="bild-01.jpg" alt="Bild 1" />
		</div>
		<div>
			<p>
				Starta spindeln med M04S1000
			</p>
		</div>
		<div>
			<!-- svelte-ignore a11y-autofocus -->
			<form>
				<input
					autofocus
					type="text"
					style="text-transform: uppercase"
					on:input={make_uppercase}
					bind:value={startRotationValue}
				/>
				<button type="submit" on:click|preventDefault={startRotation}>
					Kör
				</button>
			</form>
		</div>
		<!-- <p>1</p> -->
		{#if showModal1Wrong}
			<Modal on:close={() => (showModal1Wrong = false)}>
				<!-- <h2 slot="header">
        </h2> -->
				<p>
					Tyvärr så var det inte rätt, försök igen och tänk på
					ordningsföljden.
				</p>
			</Modal>
		{:else if showModal1Tip}
			<Modal on:close={() => (showModal1Tip = false)}>
				<p>Skriv in M04S1000 tryck på Kör</p>
			</Modal>
		{/if}
	</div>
{/if}
{#if second}
	<div class="canvas">
		<video autoplay width="700px">
			<source src="clip-1.mp4" type="video/mp4" />
			Du måste använda en annan webbläsare för att kunna spela upp video.
		</video>
		<div>
			<div>
				<p>
					Följ den blå punkten runt konturen ange G-värde X-värde
					Z-värde.
				</p>
			</div>
			<!-- svelte-ignore a11y-autofocus -->
			<form>
				<input
					autofocus
					style="text-transform: uppercase"
					type="text"
					on:input={make_uppercase}
					bind:value={point1Value}
				/>
				<button type="submit" on:click|preventDefault={point1}
					>Kör</button
				>
			</form>
		</div>
		{#if showModal2Wrong}
			<Modal on:close={() => (showModal2Wrong = false)}>
				<!-- <h2 slot="header">
        </h2> -->
				<p>
					Tyvärr så var det inte rätt, försök igen och tänk på
					ordningsföljden.
				</p>
			</Modal>
		{:else if showModal2Tip}
			<Modal on:close={() => (showModal2Tip = false)}>
				<p>G0X5Z25</p>
			</Modal>
		{/if}
	</div>
	<video width="0px">
		<source src="clip-2.mp4" type="video/mp4" />
		Du måste använda en annan webbläsare för att kunna spela upp video.
	</video>
	<!-- <p>2</p> -->
{/if}
{#if third}
	<div class="canvas">
		<video autoplay width="700px">
			<source src="clip-2.mp4" type="video/mp4" />
			Du måste använda en annan webbläsare för att kunna spela upp video.
		</video>
		<div>
			<p>
				Följ den blå punkten runt konturen ange G-värde X-värde Z-värde.
			</p>
		</div>
		<form>
			<input
				style="text-transform: uppercase"
				type="text"
				on:input={make_uppercase}
				bind:value={point1Value}
			/>
			<button type="submit" on:click|preventDefault={point1}>Kör</button>
		</form>
	</div>
	<video width="0px">
		<source src="clip-3.mp4" type="video/mp4" />
		Du måste använda en annan webbläsare för att kunna spela upp video.
	</video>
	<!-- <p>3</p> -->
{/if}
{#if fourth}
	<div class="canvas">
		<video autoplay width="700px">
			<source src="clip-2.mp4" type="video/mp4" />
			Du måste använda en annan webbläsare för att kunna spela upp video.
		</video>
		<div>
			<p>
				Följ den blå punkten runt konturen ange G-värde X-värde Z-värde.
			</p>
		</div>
		<div>
			<!-- svelte-ignore a11y-autofocus -->
			<form>
				<input
					autofocus
					style="text-transform: uppercase"
					type="text"
					on:input={make_uppercase}
					bind:value={point2Value}
				/>
				<button type="submit" on:click|preventDefault={point2}
					>Kör</button
				>
			</form>
		</div>
		{#if showModal3Wrong}
			<Modal on:close={() => (showModal3Wrong = false)}>
				<!-- <h2 slot="header">
        </h2> -->
				<p>
					Tyvärr så var det inte rätt, försök igen och tänk på
					ordningsföljden.
				</p>
			</Modal>
		{:else if showModal3Tip}
			<Modal on:close={() => (showModal3Tip = false)}>
				<p>G1X0Z20</p>
			</Modal>
		{/if}
		<div />
	</div>
	<!-- <p>4</p> -->
{/if}
{#if fift}
	<div class="canvas">
		<video autoplay width="700px">
			<source src="clip-3.mp4" type="video/mp4" />
			Du måste använda en annan webbläsare för att kunna spela upp video.
		</video>
		<div>
			<p>
				Följ den blå punkten runt konturen ange G-värde X-värde Z-värde.
			</p>
		</div>
		<form>
			<input
				style="text-transform: uppercase"
				type="text"
				on:input={make_uppercase}
				bind:value={point2Value}
			/>
			<button type="submit" on:click|preventDefault={point2}>Kör</button>
		</form>
		<div />
	</div>
	<video width="0px">
		<source src="clip-4.mp4" type="video/mp4" />
		Du måste använda en annan webbläsare för att kunna spela upp video.
	</video>
	<!-- <p>5</p> -->
{/if}
{#if sixt}
	<div class="canvas">
		<video autoplay width="700px">
			<source src="clip-3.mp4" type="video/mp4" />
			Du måste använda en annan webbläsare för att kunna spela upp video.
		</video>
		<div>
			<div>
				<p>
					Följ den blå punkten runt konturen ange G-värde X-värde
					Z-värde.
				</p>
			</div>
			<div>
				<!-- svelte-ignore a11y-autofocus -->
				<form>
					<input
						autofocus
						style="text-transform: uppercase"
						type="text"
						on:input={make_uppercase}
						bind:value={point3Value}
					/>
					<button type="submit" on:click|preventDefault={point3}
						>Kör</button
					>
				</form>
			</div>
			{#if showModal4Wrong}
				<Modal on:close={() => (showModal4Wrong = false)}>
					<!-- <h2 slot="header">
        </h2> -->
					<p>
						Tyvärr så var det inte rätt, försök igen och tänk på
						ordningsföljden.
					</p>
				</Modal>
			{:else if showModal4Tip}
				<Modal on:close={() => (showModal4Tip = false)}>
					<p>G1X10Z20</p>
				</Modal>
			{/if}
		</div>
		<div />
	</div>
	<!-- <p>6</p> -->
{/if}
{#if seventh}
	<div class="canvas">
		<video autoplay width="700px">
			<source src="clip-4.mp4" type="video/mp4" />
			Du måste använda en annan webbläsare för att kunna spela upp video.
		</video>
		<div>
			<p>
				Följ den blå punkten runt konturen ange G-värde X-värde Z-värde.
			</p>
		</div>
		<form>
			<!-- svelte-ignore a11y-autofocus -->
			<input
				autofocus
				style="text-transform: uppercase"
				type="text"
				on:input={make_uppercase}
				bind:value={point3Value}
			/>
			<button type="submit" on:click|preventDefault={point3}>Kör</button>
		</form>
		<div />
	</div>
	<video width="0px">
		<source src="clip-5.mp4" type="video/mp4" />
		Du måste använda en annan webbläsare för att kunna spela upp video.
	</video>
	<!-- <p>7</p> -->
{/if}
{#if eight}
	<div class="canvas">
		<video autoplay width="700px">
			<source src="clip-4.mp4" type="video/mp4" />
			Du måste använda en annan webbläsare för att kunna spela upp video.
		</video>
		<div>
			<div>
				<p>
					Följ den blå punkten runt konturen ange G-värde X-värde
					Z-värde.
				</p>
			</div>
			<div>
				<!-- svelte-ignore a11y-autofocus -->
				<form>
					<input
						autofocus
						style="text-transform: uppercase"
						type="text"
						on:input={make_uppercase}
						bind:value={point4Value}
					/>
					<button type="submit" on:click|preventDefault={point4}
						>Kör</button
					>
				</form>
			</div>
			{#if showModal5Wrong}
				<Modal on:close={() => (showModal5Wrong = false)}>
					<!-- <h2 slot="header">
        </h2> -->
					<p>
						Tyvärr så var det inte rätt, försök igen och tänk på
						ordningsföljden.
					</p>
				</Modal>
			{:else if showModal5Tip}
				<Modal on:close={() => (showModal5Tip = false)}>
					<p>G3X40Z5I0K-15</p>
				</Modal>
			{/if}
		</div>
		<div />
	</div>
	<!-- <p>8</p> -->
{/if}
{#if ninth}
	<div class="canvas">
		<video autoplay width="700px">
			<source src="clip-5.mp4" type="video/mp4" />
			Du måste använda en annan webbläsare för att kunna spela upp video.
		</video>
		<div>
			<p>
				Följ den blå punkten runt konturen ange G-värde X-värde Z-värde.
			</p>
		</div>
		<form>
			<input
				style="text-transform: uppercase"
				type="text"
				on:input={make_uppercase}
				bind:value={point4Value}
			/>
			<button type="submit" on:click|preventDefault={point4}>Kör</button>
		</form>
		<div />
	</div>
	<video width="0px">
		<source src="clip-6.mp4" type="video/mp4" />
		Du måste använda en annan webbläsare för att kunna spela upp video.
	</video>
	<!-- <p>9</p> -->
{/if}
{#if tenth}
	<div class="canvas">
		<video autoplay width="700px">
			<source src="clip-5.mp4" type="video/mp4" />
			Du måste använda en annan webbläsare för att kunna spela upp video.
		</video>
		<div>
			<p>
				Följ den blå punkten runt konturen ange G-värde X-värde Z-värde.
			</p>
		</div>
		<div>
			<!-- svelte-ignore a11y-autofocus -->
			<form>
				<input
					autofocus
					style="text-transform: uppercase"
					type="text"
					on:input={make_uppercase}
					bind:value={point5Value}
				/>
				<button type="submit" on:click|preventDefault={point5}
					>Kör</button
				>
			</form>
		</div>
		{#if showModal6Wrong}
			<Modal on:close={() => (showModal6Wrong = false)}>
				<!-- <h2 slot="header">
        </h2> -->
				<p>
					Tyvärr så var det inte rätt, försök igen och tänk på
					ordningsföljden.
				</p>
			</Modal>
		{:else if showModal6Tip}
			<Modal on:close={() => (showModal6Tip = false)}>
				<p>G1X40Z0</p>
			</Modal>
		{/if}
		<div />
	</div>
	<!-- <p>10</p> -->
{/if}
{#if eleventh}
	<div class="canvas">
		<video autoplay width="700px">
			<source src="clip-6.mp4" type="video/mp4" />
			Du måste använda en annan webbläsare för att kunna spela upp video.
		</video>
		<div>
			<p>
				Följ den blå punkten runt konturen ange G-värde X-värde Z-värde.
			</p>
		</div>
		<form>
			<input
				style="text-transform: uppercase"
				type="text"
				on:input={make_uppercase}
				bind:value={point5Value}
			/>
			<button type="submit" on:click|preventDefault={point5}>Kör</button>
		</form>
		<div />
	</div>
	<video width="0px">
		<source src="clip-7.mp4" type="video/mp4" />
		Du måste använda en annan webbläsare för att kunna spela upp video.
	</video>
	<!-- <p>11</p> -->
{/if}
{#if twelfth}
	<div class="canvas">
		<video autoplay width="700px">
			<source src="clip-6.mp4" type="video/mp4" />
			Du måste använda en annan webbläsare för att kunna spela upp video.
		</video>
		<div>
			<p>
				Följ den blå punkten runt konturen ange G-värde X-värde Z-värde.
			</p>
		</div>
		<div>
			<!-- svelte-ignore a11y-autofocus -->
			<form>
				<input
					autofocus
					style="text-transform: uppercase"
					type="text"
					on:input={make_uppercase}
					bind:value={point6Value}
				/>
				<button type="submit" on:click|preventDefault={point6}
					>Kör</button
				>
			</form>
		</div>
		{#if showModal7Wrong}
			<Modal on:close={() => (showModal7Wrong = false)}>
				<!-- <h2 slot="header">
        </h2> -->
				<p>
					Tyvärr så var det inte rätt, försök igen och tänk på
					ordningsföljden.
				</p>
			</Modal>
		{:else if showModal7Tip}
			<Modal on:close={() => (showModal7Tip = false)}>
				<p>G2X50Z-5I5K0</p>
			</Modal>
		{/if}
		<div />
	</div>
	<!-- <p>12</p> -->
{/if}
{#if thirteen}
	<div class="canvas">
		<video autoplay width="700px">
			<source src="clip-7.mp4" type="video/mp4" />
			Du måste använda en annan webbläsare för att kunna spela upp video.
		</video>
		<div>
			<p>
				Följ den blå punkten runt konturen ange G-värde X-värde Z-värde.
			</p>
		</div>
		<form>
			<input
				style="text-transform: uppercase"
				type="text"
				on:input={make_uppercase}
				bind:value={point6Value}
			/>
			<button type="submit" on:click|preventDefault={point6}>Kör</button>
		</form>
		<div />
	</div>
	<video width="0px">
		<source src="clip-7.mp4" type="video/mp4" />
		Du måste använda en annan webbläsare för att kunna spela upp video.
	</video>
	<!-- <p>13</p> -->
{/if}
{#if fourteen}
	<div class="canvas">
		<video autoplay width="700px">
			<source src="clip-7.mp4" type="video/mp4" />
			Du måste använda en annan webbläsare för att kunna spela upp video.
		</video>
		<div>
			<p>
				Följ den blå punkten runt konturen ange G-värde X-värde Z-värde.
			</p>
		</div>
		<div>
			<!-- svelte-ignore a11y-autofocus -->
			<form>
				<input
					autofocus
					style="text-transform: uppercase"
					type="text"
					on:input={make_uppercase}
					bind:value={point7Value}
				/>
				<button type="submit" on:click|preventDefault={point7}
					>Kör</button
				>
			</form>
		</div>
		{#if showModal8Wrong}
			<Modal on:close={() => (showModal8Wrong = false)}>
				<!-- <h2 slot="header">
        </h2> -->
				<p>
					Tyvärr så var det inte rätt, försök igen och tänk på
					ordningsföljden.
				</p>
			</Modal>
		{:else if showModal8Tip}
			<Modal on:close={() => (showModal8Tip = false)}>
				<p>G1X60Z-5</p>
			</Modal>
		{/if}
		<div />
	</div>
	<!-- <p>14</p> -->
{/if}
{#if sixteen}
	<div class="canvas">
		<video autoplay width="700px">
			<source src="clip-8.mp4" type="video/mp4" />
			Du måste använda en annan webbläsare för att kunna spela upp video.
		</video>
		<div>
			<p>
				Följ den blå punkten runt konturen ange G-värde X-värde Z-värde.
			</p>
		</div>
		<form>
			<input
				style="text-transform: uppercase"
				type="text"
				on:input={make_uppercase}
				bind:value={point8Value}
			/>
			<button type="submit" on:click|preventDefault={point8}>Kör</button>
		</form>
		{#if showModal9Wrong}
				<Modal on:close={() => (showModal9Wrong = false)}>
					<!-- <h2 slot="header">
        </h2> -->
					<p>
						Tyvärr så var det inte rätt, försök igen och tänk på
						ordningsföljden.
					</p>
				</Modal>
			{:else if showModal9Tip}
				<Modal on:close={() => (showModal9Tip = false)}>
					<p>G3X70Z-10I0K-5</p>
				</Modal>
			{/if}
		<div />
	</div>
	<video width="0px">
		<source src="clip-9.mp4" type="video/mp4" />
		Du måste använda en annan webbläsare för att kunna spela upp video.
	</video>
	<!-- <p>16</p> -->
{/if}
{#if eigtheen}
	<div class="canvas">
		<video autoplay width="700px">
			<source src="clip-9.mp4" type="video/mp4" />
			Du måste använda en annan webbläsare för att kunna spela upp video.
		</video>
		<div>
			<p>Följ den blå punkten runt konturen ange G-värde X-värde Z-värde.</p>
		</div>
		<div>
			<!-- svelte-ignore a11y-autofocus -->
			<form>
				<input
					autofocus
					style="text-transform: uppercase"
					type="text"
					on:input={make_uppercase}
					bind:value={point9Value}
				/>
				<button
					type="submit"
					on:click|preventDefault={end}
					on:focus={deleteVideo}
				>
					Kör
				</button>
			</form>
			{#if showModal10Wrong}
				<Modal on:close={() => (showModal10Wrong = false)}>
					<!-- <h2 slot="header">
        </h2> -->
					<p>
						Tyvärr så var det inte rätt, försök igen och tänk på
						ordningsföljden.
					</p>
				</Modal>
			{:else if showModal10Tip}
				<Modal on:close={() => (showModal10Tip = false)}>
					<p>G1X70Z-30</p>
				</Modal>
			{/if}
		</div>
		<div />
	</div>
	<!-- <p>18</p> -->
{/if}
{#if nineteen}
	<div class="canvas">
		<video autoplay width="700px">
			<source src="clip-10.mp4" type="video/mp4" />
		</video>
	</div>
	<div>
		<h1>Det är allt!</h1>
		<p>Du är nu klar med övningen. Bra jobbat!</p>
	</div>
	<!-- <p>19</p> -->
{/if}

<style>
	.canvas {
		left: 0;
		width: 700px;
	}
</style>
