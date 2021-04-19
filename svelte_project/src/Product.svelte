<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
    export let name = '...';
    export let age = '...';
    let ananke = 'Glutokrates';
</script>

<p>I'm a product {name}</p>
<slot />
<p>My age is {age}</p>
<button on:click={() => dispatch('deleteName', 'test')} >Delete name</button>
<button on:click={() => dispatch('setDefault')} >Default name</button>
