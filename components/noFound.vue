<template>
  <div>
    <Loading />
    <b-container>
      <b-row class="text-center" align-v="center">
        <b-col class="mt-4">
          <b-alert variant="warning" show>
            <h1>Este módulo no existe</h1>
            <h2>{{ $route.path }}</h2>
          </b-alert>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>
