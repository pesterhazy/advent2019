(ns advent.puzzle01
  (:require [advent.util]))

(defn fuel [mass] (-> mass (quot 3) (- 2) (Math/max 0)))

(defn fuel* [mass]
  (->> (iterate fuel mass) (drop 1) (take-while pos?) (apply +)))

(defn read-input []
  (advent.util/read-longs "1.txt"))

(defn solution []
  (->> (map fuel (read-input)) (apply +)))

(defn solution-2 []
  (->> (map fuel* (read-input)) (apply +)))
