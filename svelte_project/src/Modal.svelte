<script>
    import { createEventDispatcher, onDestroy, onMount, beforeUpdate, afterUpdate } from 'svelte';
    const dispatch = createEventDispatcher();
    let customStyle = 15;
    let enabled = false;
    console.log('Script ran Modal!')
    onMount(() => {console.log('On mount!')})
    onDestroy(() => console.log('On destroy!'))
    afterUpdate(() => {console.log('After update')})
    beforeUpdate(() => {console.log('Before update')})

</script>

<style>
    .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        z-index: 3;
        background: rgba(0, 0, 0, 0.8);
    }

    @media screen and (max-width: 600px){
        .pop {
            position: absolute;
            border-radius: 0.5em;
            width: 60% !important;
            height: 5em;
            max-height: 10em;
            z-index: 4;
            top: 25% !important;
            left: 20% !important;
        }
    }

    .pop {
        position: absolute;
        border-radius: 0.5em;
        width: 25%;
        height: 5em;
        max-height: 10em;
        background: beige;
        z-index: 4;
        top: 25%;
        left: 37.5%;
        overflow: auto;
    }
    button {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0.5em;
        margin: auto;
    }

    button#close {
        bottom: 2.3em;
    }

</style>

<div class="modal"></div>
<div class="pop">
    <p style="text-align: center">Click on disclaimer</p>
    <p>There is some action needed!</p><p>There is some action needed!</p>
    <button on:click="{() => enabled = true}">Disclaimer</button>
    <slot name="dismiss" didAgreed="{enabled}">
        <button id="close" on:click={() => dispatch('modal')} disabled="{!enabled}">Close</button>
    </slot>
</div>