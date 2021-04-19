<script>
	import Product from './Product.svelte';
	import View from './View.svelte';
	import Modal from './Modal.svelte';
	let modal = false;
	let allowed;
	let name = 'Hershell';
	let products = {
		id : 'hdks',
		name : 'Hershell',
		age : 13,
	};
	console.log('Script ran App!')
</script>

<Product {...products} on:deleteName={() => name = 'Abulafia'} on:setDefault={() => alert('Hello')}>
	<p>Test SLOT</p>
</Product>
<View item="{name}"/>
<button on:click={() => modal = true}>Modal</button>
{#if modal}
	<Modal on:modal={() => modal = false}>
<!--		 <button let:didAgreed="{allowed}" slot="dismiss" on:click={() => modal = false} disabled="{!allowed}">App close</button>-->
	</Modal>
{/if}


