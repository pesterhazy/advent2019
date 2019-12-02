(ns advent.puzzle02
  (:require [advent.util :as u]
            :reload))

(def example "1,9,10,3,2,3,11,0,99,30,40,50")

(defn parse-state
  [ns]
  {:mem (vec ns),
   :ip 0})

(defn next-state
  [{:keys [ip mem], :as state}]
  (let [mget (fn [addr] (nth mem addr))
        mget-rel (fn [rel-addr] (mget (+ ip rel-addr)))
        mset (fn [state addr val] (assoc state :mem (assoc mem addr val)))
        mjump-rel (fn [state rel-addr] (assoc state :ip (+ ip rel-addr)))]
    (case (mget-rel 0)
      1 (-> state
            (mset (mget-rel 3) (+ (mget (mget-rel 1)) (mget (mget-rel 2))))
            (mjump-rel 4))
      2 (-> state
            (mset (mget-rel 3) (* (mget (mget-rel 1)) (mget (mget-rel 2))))
            (mjump-rel 4))
      99 (assoc state :halted? true))))

(defn patch
  "Like merge but for vectors; takes [pos v] pairs"
  [v m]
  (reduce (fn [acc [k v]] (assoc acc k v)) v m))

(defn solution
  []
  (let [initial-state (-> (first (u/read-csv-longs "2.txt"))
                          parse-state
                          (update :mem patch {1 12 2 2}))]
    (->> (iterate next-state initial-state)
         (take-while #(not (:halted? %)))
         last
         :mem
         first)))
